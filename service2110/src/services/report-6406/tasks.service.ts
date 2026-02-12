import { db } from '../../db/index.js';
import { 
  report6406Tasks, 
  report6406PackageTasks, 
  report6406Packages,
  report6406TaskStatusHistory,
  report6406TaskBranches,
  branches,
  TaskStatus,
} from '../../db/schema/index.js';
import { eq, and, inArray, gte, lte, sql, desc, asc, ne, exists, not } from 'drizzle-orm';
import type {
  CreateTaskInput,
  GetTasksRequest,
  TasksListResponse,
  TaskDetail,
  TaskDetails,
  BulkDeleteTasksInput,
  BulkDeleteResponse,
  BulkCancelTasksInput,
  BulkCancelResponse,
  CancelTaskResponse,
  Task,
  StartTasksInput,
  StartTasksResponse,
} from '../../schemas/report-6406/tasks.schema.js';
import { getStatusPermissions } from '../../types/status-model.js';
import { storageService } from './storage.service.js';

export class TasksService {
  /**
   * Создать новое задание
   */
  async createTask(input: CreateTaskInput, createdBy: string): Promise<TaskDetails> {
    // Определить массив филиалов: используем branchIds если есть, иначе branchId
    const branchIds = input.branchIds || (input.branchId ? [input.branchId] : []);
    
    if (branchIds.length === 0) {
      throw new Error('At least one branchId must be provided');
    }

    // Получить информацию о филиалах
    const branchList = await db
      .select()
      .from(branches)
      .where(inArray(branches.id, branchIds));

    if (branchList.length !== branchIds.length) {
      const foundIds = branchList.map(b => b.id);
      const missingIds = branchIds.filter(id => !foundIds.includes(id));
      throw new Error(`Branches with ids ${missingIds.join(', ')} not found`);
    }

    // Первый филиал используется как основной для обратной совместимости
    const primaryBranch = branchList[0];

    // Используем транзакцию для создания задания, связи с филиалами и записи в историю
    return await db.transaction(async (trx) => {
      const [task] = await trx
        .insert(report6406Tasks)
        .values({
          branchId: primaryBranch.id,
          branchName: primaryBranch.name,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          accountMask: input.accountMask || null,
          accountSecondOrder: input.accountSecondOrder || null,
          currency: input.currency ?? 'RUB',
          format: input.format,
          reportType: input.reportType,
          source: input.source || null,
          status: TaskStatus.CREATED,
          createdBy,
          filesCount: 0,
        })
        .returning();

      // Создать связи с филиалами
      await trx.insert(report6406TaskBranches).values(
        branchList.map(branch => ({
          taskId: task.id,
          branchId: branch.id,
        }))
      );

      // Добавить запись в историю статусов
      await trx.insert(report6406TaskStatusHistory).values({
        taskId: task.id,
        status: TaskStatus.CREATED,
        previousStatus: null,
        changedAt: new Date(),
        changedBy: createdBy,
        comment: 'Task created',
      });

      return this.getTaskById(task.id);
    });
  }

  /**
   * Получить список заданий с фильтрацией и пагинацией (body: pagination, sorting, filter)
   */
  async getTasks(body: GetTasksRequest): Promise<TasksListResponse> {
    const { pagination, sorting, filter, includedInPacket, excludedInPacket } = body;
    const pageNumber = pagination.number;
    const pageSize = pagination.size;

    // Построение WHERE из filter[] и параметров фильтрации по пакету
    const conditions = this.buildFilterConditions(filter, includedInPacket, excludedInPacket);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Подсчет общего количества
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406Tasks)
      .where(whereClause);

    // Сортировка: column -> DB column, direction 'asc'|'desc'
    type SortableColumn =
      | typeof report6406Tasks.createdAt
      | typeof report6406Tasks.branchId
      | typeof report6406Tasks.status
      | typeof report6406Tasks.periodStart
      | typeof report6406Tasks.periodEnd
      | typeof report6406Tasks.updatedAt
      | typeof report6406Tasks.branchName
      | typeof report6406Tasks.reportType
      | typeof report6406Tasks.format
      | typeof report6406Tasks.createdBy;
    const sortColumnMap: Record<string, SortableColumn> = {
      createdAt: report6406Tasks.createdAt,
      branchId: report6406Tasks.branchId,
      status: report6406Tasks.status,
      periodStart: report6406Tasks.periodStart,
      periodEnd: report6406Tasks.periodEnd,
      updatedAt: report6406Tasks.updatedAt,
      branchName: report6406Tasks.branchName,
      reportType: report6406Tasks.reportType,
      format: report6406Tasks.format,
      createdBy: report6406Tasks.createdBy,
    };
    const orderByColumn = sortColumnMap[sorting.column] ?? report6406Tasks.createdAt;
    const orderByClause = sorting.direction === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение данных
    const tasks = await db
      .select()
      .from(report6406Tasks)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize);

    // Подгрузка packageIds для заданий списка (связь many-to-many)
    const taskIds = tasks.map((t) => t.id);
    const packageLinks =
      taskIds.length > 0
        ? await db
            .select({
              taskId: report6406PackageTasks.taskId,
              packageId: report6406PackageTasks.packageId,
            })
            .from(report6406PackageTasks)
            .where(inArray(report6406PackageTasks.taskId, taskIds))
        : [];
    const taskIdToPackageIds = new Map<string, string[]>();
    for (const link of packageLinks) {
      const arr = taskIdToPackageIds.get(link.taskId) ?? [];
      arr.push(link.packageId);
      taskIdToPackageIds.set(link.taskId, arr);
    }

    // Подгрузка branchIds для заданий списка (связь many-to-many)
    const branchLinks =
      taskIds.length > 0
        ? await db
            .select({
              taskId: report6406TaskBranches.taskId,
              branchId: report6406TaskBranches.branchId,
              branchName: branches.name,
            })
            .from(report6406TaskBranches)
            .innerJoin(branches, eq(report6406TaskBranches.branchId, branches.id))
            .where(inArray(report6406TaskBranches.taskId, taskIds))
        : [];
    const taskIdToBranchIds = new Map<string, string[]>();
    const taskIdToBranchNames = new Map<string, string[]>();
    for (const link of branchLinks) {
      const ids = taskIdToBranchIds.get(link.taskId) ?? [];
      ids.push(link.branchId);
      taskIdToBranchIds.set(link.taskId, ids);
      
      const names = taskIdToBranchNames.get(link.taskId) ?? [];
      names.push(link.branchName);
      taskIdToBranchNames.set(link.taskId, names);
    }

    return {
      items: tasks.map((task) =>
        this.formatTaskListItem(
          task, 
          taskIdToPackageIds.get(task.id) ?? [],
          taskIdToBranchIds.get(task.id) ?? [task.branchId],
          taskIdToBranchNames.get(task.id) ?? [task.branchName],
        ),
      ),
      totalItems: count,
    };
  }

  /**
   * Построение условий WHERE из массива FilterDto и параметров фильтрации по пакету
   * Поддержка фильтра packageId: задания в/не в указанном пакете (связь через report_6406_package_tasks).
   * Поддержка параметров includedInPacket и excludedInPacket для фильтрации по пакету.
   */
  private buildFilterConditions(
    filter: GetTasksRequest['filter'],
    includedInPacket?: string,
    excludedInPacket?: string,
  ) {
    const conditions: Array<ReturnType<typeof eq> | ReturnType<typeof sql>> = [];

    // Фильтр по пакету через includedInPacket/excludedInPacket (приоритет над filter.packageId)
    if (includedInPacket) {
      // Задания, входящие в пакет с указанным ID
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(report6406PackageTasks)
            .where(
              and(
                eq(report6406PackageTasks.taskId, report6406Tasks.id),
                eq(report6406PackageTasks.packageId, includedInPacket),
              ),
            ),
        ),
      );
    } else if (excludedInPacket) {
      // Задания, НЕ входящие в пакет с указанным ID
      conditions.push(
        not(
          exists(
            db
              .select({ one: sql`1` })
              .from(report6406PackageTasks)
              .where(
                and(
                  eq(report6406PackageTasks.taskId, report6406Tasks.id),
                  eq(report6406PackageTasks.packageId, excludedInPacket),
                ),
              ),
          ),
        ),
      );
    } else if (filter?.packageId !== undefined) {
      // Фильтр по пакету через filter.packageId (для обратной совместимости)
      if (filter.packageId === null) {
        // Задания, не входящие ни в один пакет
        conditions.push(
          not(
            exists(
              db
                .select({ one: sql`1` })
                .from(report6406PackageTasks)
                .where(eq(report6406PackageTasks.taskId, report6406Tasks.id)),
            ),
          ),
        );
      } else {
        // Задания, входящие в пакет с указанным ID
        conditions.push(
          exists(
            db
              .select({ one: sql`1` })
              .from(report6406PackageTasks)
              .where(
                and(
                  eq(report6406PackageTasks.taskId, report6406Tasks.id),
                  eq(report6406PackageTasks.packageId, filter.packageId),
                ),
              ),
          ),
        );
      }
    }

    if (!filter) return conditions;

    // Фильтр по филиалам: задания, связанные с указанными филиалами (связь many-to-many через report_6406_task_branches)
    if (filter.branchIds !== undefined && filter.branchIds.length > 0) {
      conditions.push(
        exists(
          db
            .select({ one: sql`1` })
            .from(report6406TaskBranches)
            .where(
              and(
                eq(report6406TaskBranches.taskId, report6406Tasks.id),
                inArray(report6406TaskBranches.branchId, filter.branchIds),
              ),
            ),
        ),
      );
    }

    // Фильтры по строковым полям
    if (filter.branchName !== undefined) {
      conditions.push(eq(report6406Tasks.branchName, filter.branchName));
    }
    if (filter.status !== undefined) {
      conditions.push(eq(report6406Tasks.status, filter.status));
    }
    if (filter.reportType !== undefined) {
      conditions.push(eq(report6406Tasks.reportType, filter.reportType));
    }
    if (filter.format !== undefined) {
      conditions.push(eq(report6406Tasks.format, filter.format));
    }
    if (filter.source !== undefined) {
      conditions.push(eq(report6406Tasks.source, filter.source));
    }
    if (filter.createdBy !== undefined) {
      conditions.push(eq(report6406Tasks.createdBy, filter.createdBy));
    }

    // Фильтры по датам (YYYY-MM-DD)
    if (filter.periodStart !== undefined) {
      conditions.push(eq(report6406Tasks.periodStart, filter.periodStart));
    }
    if (filter.periodEnd !== undefined) {
      conditions.push(eq(report6406Tasks.periodEnd, filter.periodEnd));
    }

    // Фильтры по дате-времени (ISO 8601)
    if (filter.createdAt !== undefined) {
      const d = new Date(filter.createdAt);
      conditions.push(eq(report6406Tasks.createdAt, d));
    }
    if (filter.updatedAt !== undefined) {
      const d = new Date(filter.updatedAt);
      conditions.push(eq(report6406Tasks.updatedAt, d));
    }

    return conditions;
  }

  /**
   * Получить задание по ID с информацией о пакетах (TaskDetailsDto — без fileUrl, errorMessage; с s3FolderId, type, accounts)
   */
  async getTaskById(id: string): Promise<TaskDetails> {
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, id))
      .limit(1);

    if (!task) {
      throw new Error(`Report task with id '${id}' not found`);
    }

    // Получить пакеты, в которых находится задание
    const packagesList = await db
      .select({
        id: report6406Packages.id,
        name: report6406Packages.name,
        addedAt: report6406PackageTasks.addedAt,
      })
      .from(report6406PackageTasks)
      .innerJoin(report6406Packages, eq(report6406PackageTasks.packageId, report6406Packages.id))
      .where(eq(report6406PackageTasks.taskId, id));

    // Получить филиалы, связанные с заданием
    const taskBranches = await db
      .select({
        branchId: report6406TaskBranches.branchId,
        branchName: branches.name,
      })
      .from(report6406TaskBranches)
      .innerJoin(branches, eq(report6406TaskBranches.branchId, branches.id))
      .where(eq(report6406TaskBranches.taskId, id))
      .orderBy(asc(branches.name));

    return this.formatTaskDetails(task, packagesList, taskBranches);
  }

  /**
   * Удалить задание
   */
  async deleteTask(id: string): Promise<void> {
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, id))
      .limit(1);

    if (!task) {
      throw new Error(`Report task with id '${id}' not found`);
    }

    if (!this.canDelete(task.status)) {
      throw new Error(`Cannot delete task in ${task.status} status`);
    }

    await db.delete(report6406Tasks).where(eq(report6406Tasks.id, id));
  }

  /**
   * Массовое удаление заданий (универсальный метод для одного или нескольких)
   */
  async bulkDeleteTasks(input: BulkDeleteTasksInput): Promise<BulkDeleteResponse> {
    let deleted = 0;
    const results: Array<{ taskId: string; success: boolean; reason?: string }> = [];

    for (const taskId of input.taskIds) {
      try {
        await this.deleteTask(taskId);
        deleted++;
        results.push({
          taskId,
          success: true,
        });
      } catch (error) {
        results.push({
          taskId,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      deleted,
      failed: input.taskIds.length - deleted,
      results,
    };
  }

  /**
   * Отменить задание
   */
  async cancelTask(id: string, cancelledBy?: string): Promise<CancelTaskResponse> {
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, id))
      .limit(1);

    if (!task) {
      throw new Error(`Report task with id '${id}' not found`);
    }

    if (!this.canCancel(task.status)) {
      throw new Error(`Cannot cancel task in ${task.status} status`);
    }

    // Используем транзакцию для обновления статуса и добавления в историю
    const updatedTask = await db.transaction(async (trx) => {
      const [updated] = await trx
        .update(report6406Tasks)
        .set({
          status: TaskStatus.KILLED_DAPP, // Используем статус killed_dapp для отмены
          lastStatusChangedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(report6406Tasks.id, id))
        .returning();

      // Добавляем запись в историю
      await trx.insert(report6406TaskStatusHistory).values({
        taskId: id,
        status: TaskStatus.KILLED_DAPP,
        previousStatus: task.status as TaskStatus,
        changedAt: new Date(),
        changedBy: cancelledBy || null,
        comment: 'Task cancelled by user',
      });

      return updated;
    });

    return {
      id: updatedTask.id,
      status: updatedTask.status as TaskStatus,
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
  }

  /**
   * Массовая отмена заданий (универсальный метод для одного или нескольких)
   */
  async bulkCancelTasks(input: BulkCancelTasksInput, cancelledBy?: string): Promise<BulkCancelResponse> {
    let cancelled = 0;
    const results: Array<{ 
      taskId: string; 
      success: boolean; 
      status?: TaskStatus;
      updatedAt?: string;
      reason?: string;
    }> = [];

    for (const taskId of input.taskIds) {
      try {
        const result = await this.cancelTask(taskId, cancelledBy);
        cancelled++;
        results.push({
          taskId,
          success: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: result.status as any,
          updatedAt: result.updatedAt,
        });
      } catch (error) {
        results.push({
          taskId,
          success: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      cancelled,
      failed: input.taskIds.length - cancelled,
      results,
    };
  }

  /**
   * Запустить задания на выполнение
   */
  async startTasks(input: StartTasksInput, startedBy?: string): Promise<StartTasksResponse> {
    let started = 0;
    const results: StartTasksResponse['results'] = [];
    const errors: StartTasksResponse['errors'] = [];

    for (const taskId of input.taskIds) {
      try {
        // Получаем задание
        const [task] = await db
          .select()
          .from(report6406Tasks)
          .where(eq(report6406Tasks.id, taskId))
          .limit(1);

        if (!task) {
          errors.push({
            taskId,
            reason: `Task with id '${taskId}' not found`,
          });
          continue;
        }

        // Проверяем права на запуск
        const permissions = getStatusPermissions(task.status as TaskStatus);
        if (!permissions.canStart) {
          errors.push({
            taskId,
            reason: `Cannot start task in '${task.status}' status. Only tasks with status 'created' can be started`,
          });
          continue;
        }

        // Проверяем наличие свободного места (моковая проверка: 100MB на задание)
        const estimatedSize = 104857600; // 100MB
        const freeBytes = await storageService.getStorageFreeBytes();
        if (freeBytes < estimatedSize) {
          errors.push({
            taskId,
            reason: `Not enough storage space. Required: 100MB, Available: ${(freeBytes / 1024 / 1024).toFixed(2)}MB`,
          });
          continue;
        }

        // Запускаем задание в транзакции
        const updatedTask = await db.transaction(async (trx) => {
          const [updated] = await trx
            .update(report6406Tasks)
            .set({
              status: TaskStatus.STARTED,
              startedAt: new Date(),
              lastStatusChangedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(report6406Tasks.id, taskId))
            .returning();

          // Добавляем запись в историю
          await trx.insert(report6406TaskStatusHistory).values({
            taskId,
            status: TaskStatus.STARTED,
            previousStatus: task.status as TaskStatus,
            changedAt: new Date(),
            changedBy: startedBy || null,
            comment: 'Task started by user',
          });

          return updated;
        });

        results.push({
          taskId: updatedTask.id,
          status: updatedTask.status as TaskStatus,
          startedAt: updatedTask.startedAt!.toISOString(),
        });
        started++;
      } catch (error) {
        errors.push({
          taskId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      started,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Проверка возможности отмены задания
   */
  private canCancel(status: string): boolean {
    const permissions = getStatusPermissions(status as TaskStatus);
    return permissions.canCancel;
  }

  /**
   * Проверка возможности удаления задания
   */
  private canDelete(status: string): boolean {
    const permissions = getStatusPermissions(status as TaskStatus);
    return permissions.canDelete;
  }

  /**
   * Проверка возможности запуска задания
   */
  private canStart(status: string): boolean {
    const permissions = getStatusPermissions(status as TaskStatus);
    return permissions.canStart;
  }

  /**
   * Проверка возможности добавления в пакет
   */
  canAddToPackage(status: string): boolean {
    return status === TaskStatus.COMPLETED;
  }

  /**
   * Форматирование задания для API
   */
  private async formatTask(task: typeof report6406Tasks.$inferSelect): Promise<Task> {
    const permissions = getStatusPermissions(task.status as TaskStatus);
    
    // Получить филиалы, связанные с заданием
    const taskBranches = await db
      .select({
        branchId: report6406TaskBranches.branchId,
        branchName: branches.name,
      })
      .from(report6406TaskBranches)
      .innerJoin(branches, eq(report6406TaskBranches.branchId, branches.id))
      .where(eq(report6406TaskBranches.taskId, task.id))
      .orderBy(asc(branches.name));

    const branchIds = taskBranches.length > 0 
      ? taskBranches.map(b => b.branchId)
      : [task.branchId];
    const branchNames = taskBranches.length > 0
      ? taskBranches.map(b => b.branchName)
      : [task.branchName];
    
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      createdBy: task.createdBy ?? '',
      branchId: task.branchId,
      branchIds,
      branchName: task.branchName,
      branchNames,
      periodStart: task.periodStart,
      periodEnd: task.periodEnd,
      accountMask: task.accountMask,
      accountSecondOrder: task.accountSecondOrder,
      currency: task.currency,
      format: task.format,
      reportType: task.reportType,
      source: task.source,
      status: task.status as TaskStatus,
      canCancel: permissions.canCancel,
      canDelete: permissions.canDelete,
      canStart: permissions.canStart,
      fileSize: task.fileSize,
      filesCount: task.filesCount,
      fileUrl: task.fileUrl,
      errorMessage: task.errorMessage,
      lastStatusChangedAt: task.lastStatusChangedAt.toISOString(),
      startedAt: task.startedAt?.toISOString() ?? null,
      completedAt: task.completedAt?.toISOString() ?? null,
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * Форматирование задания для TaskDetailsDto (POST 201 и GET /:id 200).
   * Без fileUrl, errorMessage; с s3FolderId, type, accounts, packages.
   */
  private formatTaskDetails(
    task: typeof report6406Tasks.$inferSelect,
    packagesList: Array<{ id: string; name: string; addedAt: Date }>,
    taskBranches: Array<{ branchId: string; branchName: string }> = [],
  ): TaskDetails {
    const permissions = getStatusPermissions(task.status as TaskStatus);
    
    const branchIds = taskBranches.length > 0 
      ? taskBranches.map(b => b.branchId)
      : [task.branchId];
    const branchNames = taskBranches.length > 0
      ? taskBranches.map(b => b.branchName)
      : [task.branchName];
    
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      createdBy: task.createdBy ?? '',
      branchId: task.branchId,
      branchIds,
      branchName: task.branchName,
      branchNames,
      periodStart: task.periodStart,
      periodEnd: task.periodEnd,
      accountMask: task.accountMask,
      accountSecondOrder: task.accountSecondOrder,
      currency: task.currency,
      format: task.format,
      reportType: task.reportType,
      source: task.source,
      status: task.status as TaskStatus,
      canCancel: permissions.canCancel,
      canDelete: permissions.canDelete,
      canStart: permissions.canStart,
      fileSize: task.fileSize,
      filesCount: task.filesCount,
      lastStatusChangedAt: task.lastStatusChangedAt.toISOString(),
      startedAt: task.startedAt?.toISOString() ?? null,
      completedAt: task.completedAt?.toISOString() ?? null,
      updatedAt: task.updatedAt.toISOString(),
      s3FolderId: null,
      type: task.reportType,
      accounts: [],
      packages: packagesList.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        addedAt: pkg.addedAt.toISOString(),
      })),
    };
  }

  /**
   * Форматирование задания для списка (TaskListItemDto), с полем packageIds
   */
  private formatTaskListItem(
    task: typeof report6406Tasks.$inferSelect,
    packageIds: string[] = [],
    branchIds: string[] = [task.branchId],
    branchNames: string[] = [task.branchName],
  ) {
    const permissions = getStatusPermissions(task.status as TaskStatus);
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      createdBy: task.createdBy ?? '',
      branchId: task.branchId,
      branchIds,
      branchName: task.branchName,
      branchNames,
      periodStart: task.periodStart,
      periodEnd: task.periodEnd,
      status: task.status as TaskStatus,
      fileSize: task.fileSize,
      format: task.format,
      reportType: task.reportType,
      updatedAt: task.updatedAt.toISOString(),
      canCancel: permissions.canCancel,
      canDelete: permissions.canDelete,
      canStart: permissions.canStart,
      packageIds,
    };
  }
}

export const tasksService = new TasksService();
