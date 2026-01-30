import { db } from '../../db/index.js';
import { 
  report6406Tasks, 
  report6406PackageTasks, 
  report6406Packages,
  report6406TaskStatusHistory,
  branches,
  TaskStatus,
} from '../../db/schema/index.js';
import { eq, and, inArray, gte, lte, sql, desc, asc, ne } from 'drizzle-orm';
import type {
  CreateTaskInput,
  GetTasksRequest,
  TasksListResponse,
  TaskDetail,
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
  async createTask(input: CreateTaskInput, createdBy?: string): Promise<Task> {
    // Получить название филиала
    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, input.branchId))
      .limit(1);

    if (!branch) {
      throw new Error(`Branch with id ${input.branchId} not found`);
    }

    // Используем транзакцию для создания задания и записи в историю
    return await db.transaction(async (trx) => {
      const [task] = await trx
        .insert(report6406Tasks)
        .values({
          branchId: input.branchId,
          branchName: branch.name,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          accountMask: input.accountMask || null,
          accountMaskSecondOrder: input.accountMaskSecondOrder || null,
          currency: input.currency,
          format: input.format,
          reportType: input.reportType,
          source: input.source || null,
          status: TaskStatus.CREATED,
          createdBy: createdBy || null,
          filesCount: 0,
        })
        .returning();

      // Добавить запись в историю статусов
      await trx.insert(report6406TaskStatusHistory).values({
        taskId: task.id,
        status: TaskStatus.CREATED,
        previousStatus: null,
        changedAt: new Date(),
        changedBy: createdBy || null,
        comment: 'Task created',
      });

      return this.formatTask(task);
    });
  }

  /**
   * Получить список заданий с фильтрацией и пагинацией (body: pagination, sorting, filter)
   */
  async getTasks(body: GetTasksRequest): Promise<TasksListResponse> {
    const { pagination, sorting, filter } = body;
    const pageNumber = pagination.number;
    const pageSize = pagination.size;

    // Построение WHERE из filter[]
    const conditions = this.buildFilterConditions(filter);

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

    return {
      items: tasks.map((task) => this.formatTaskListItem(task)),
      totalItems: count,
    };
  }

  /**
   * Построение условий WHERE из массива FilterDto
   */
  private buildFilterConditions(filter: GetTasksRequest['filter']) {
    if (!filter?.length) return [];

    type StringCol =
      | typeof report6406Tasks.branchId
      | typeof report6406Tasks.branchName
      | typeof report6406Tasks.status
      | typeof report6406Tasks.reportType
      | typeof report6406Tasks.format
      | typeof report6406Tasks.source
      | typeof report6406Tasks.createdBy;
    type DateCol = typeof report6406Tasks.periodStart | typeof report6406Tasks.periodEnd;
    type DateTimeCol = typeof report6406Tasks.createdAt | typeof report6406Tasks.updatedAt;
    const conditions: ReturnType<typeof eq>[] = [];
    const stringColumns: Record<string, StringCol> = {
      branchId: report6406Tasks.branchId,
      branchName: report6406Tasks.branchName,
      status: report6406Tasks.status,
      reportType: report6406Tasks.reportType,
      format: report6406Tasks.format,
      source: report6406Tasks.source,
      createdBy: report6406Tasks.createdBy,
    };
    const dateColumns: Record<string, DateCol> = {
      periodStart: report6406Tasks.periodStart,
      periodEnd: report6406Tasks.periodEnd,
    };
    const dateTimeColumns: Record<string, DateTimeCol> = {
      createdAt: report6406Tasks.createdAt,
      updatedAt: report6406Tasks.updatedAt,
    };

    for (const f of filter) {
      const col = stringColumns[f.column];
      if (col) {
        if (f.operator === 'equals') {
          conditions.push(eq(col, f.value));
        } else if (f.operator === 'notEquals') {
          conditions.push(ne(col, f.value));
        } else if (f.operator === 'contains') {
          conditions.push(sql`${col}::text ILIKE ${'%' + f.value + '%'}` as ReturnType<typeof eq>);
        }
        continue;
      }
      const dateCol = dateColumns[f.column];
      if (dateCol) {
        if (f.operator === 'equals') {
          conditions.push(eq(dateCol, f.value));
        } else if (f.operator === 'notEquals') {
          conditions.push(ne(dateCol, f.value));
        } else if (f.operator === 'greaterThan') {
          conditions.push(sql`${dateCol} > ${f.value}` as ReturnType<typeof eq>);
        } else if (f.operator === 'lessThan') {
          conditions.push(sql`${dateCol} < ${f.value}` as ReturnType<typeof eq>);
        }
        continue;
      }
      const dtCol = dateTimeColumns[f.column];
      if (dtCol) {
        const d = new Date(f.value);
        if (f.operator === 'equals') {
          conditions.push(eq(dtCol, d));
        } else if (f.operator === 'notEquals') {
          conditions.push(ne(dtCol, d));
        } else if (f.operator === 'greaterThan') {
          conditions.push(gte(dtCol, d));
        } else if (f.operator === 'lessThan') {
          conditions.push(lte(dtCol, d));
        }
      }
    }
    return conditions;
  }

  /**
   * Получить задание по ID с информацией о пакетах
   */
  async getTaskById(id: string): Promise<TaskDetail> {
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

    return {
      ...this.formatTask(task),
      packages: packagesList.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        addedAt: pkg.addedAt.toISOString(),
      })),
    };
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
        const storageInfo = await storageService.getStorageVolume();
        
        if (storageInfo.freeBytes < estimatedSize) {
          errors.push({
            taskId,
            reason: `Not enough storage space. Required: 100MB, Available: ${(storageInfo.freeBytes / 1024 / 1024).toFixed(2)}MB`,
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
  private formatTask(task: typeof report6406Tasks.$inferSelect): Task {
    const permissions = getStatusPermissions(task.status as TaskStatus);
    
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      createdBy: task.createdBy,
      branchId: task.branchId,
      branchName: task.branchName,
      periodStart: task.periodStart,
      periodEnd: task.periodEnd,
      accountMask: task.accountMask,
      accountMaskSecondOrder: task.accountMaskSecondOrder,
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
   * Форматирование задания для списка (TaskListItemDto)
   */
  private formatTaskListItem(task: typeof report6406Tasks.$inferSelect) {
    const permissions = getStatusPermissions(task.status as TaskStatus);
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      createdBy: task.createdBy,
      branchId: task.branchId,
      branchName: task.branchName,
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
    };
  }
}

export const tasksService = new TasksService();
