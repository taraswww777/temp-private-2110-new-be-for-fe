import { db } from '../../db/index.js';
import { 
  report6406Tasks, 
  report6406PackageTasks, 
  report6406Packages,
  branches,
  ReportTaskStatus,
} from '../../db/schema/index.js';
import { eq, and, inArray, gte, lte, sql, desc, asc } from 'drizzle-orm';
import type {
  CreateTaskInput,
  TasksQuery,
  TasksListResponse,
  TaskDetail,
  BulkDeleteTasksInput,
  BulkDeleteResponse,
  BulkCancelTasksInput,
  BulkCancelResponse,
  CancelTaskResponse,
  Task,
} from '../../schemas/report-6406/tasks.schema';

export class TasksService {
  /**
   * Создать новое задание
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // Получить название филиала
    const [branch] = await db
      .select()
      .from(branches)
      .where(eq(branches.id, input.branchId))
      .limit(1);

    if (!branch) {
      throw new Error(`Branch with id ${input.branchId} not found`);
    }

    const [task] = await db
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
        status: ReportTaskStatus.PENDING,
      })
      .returning();

    return this.formatTask(task);
  }

  /**
   * Получить список заданий с фильтрацией и пагинацией
   */
  async getTasks(query: TasksQuery): Promise<TasksListResponse> {
    const { page, limit, sortBy, sortOrder, status, branchId, reportType, periodStartFrom, periodStartTo } = query;
    
    // Построение WHERE условий
    const conditions = [];
    
    if (status && status.length > 0) {
      conditions.push(inArray(report6406Tasks.status, status));
    }
    
    if (branchId) {
      conditions.push(eq(report6406Tasks.branchId, branchId));
    }
    
    if (reportType && reportType.length > 0) {
      conditions.push(inArray(report6406Tasks.reportType, reportType));
    }
    
    if (periodStartFrom) {
      conditions.push(gte(report6406Tasks.periodStart, periodStartFrom));
    }
    
    if (periodStartTo) {
      conditions.push(lte(report6406Tasks.periodStart, periodStartTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Подсчет общего количества
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406Tasks)
      .where(whereClause);

    // Сортировка
    const orderByColumn = {
      createdAt: report6406Tasks.createdAt,
      branchId: report6406Tasks.branchId,
      status: report6406Tasks.status,
      periodStart: report6406Tasks.periodStart,
    }[sortBy];

    const orderByClause = sortOrder === 'ASC' ? asc(orderByColumn) : desc(orderByColumn);

    // Получение данных
    const tasks = await db
      .select()
      .from(report6406Tasks)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(page * limit);

    return {
      tasks: tasks.map(task => this.formatTaskListItem(task)),
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
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
   * Массовое удаление заданий
   */
  async bulkDeleteTasks(input: BulkDeleteTasksInput): Promise<BulkDeleteResponse> {
    let deleted = 0;
    const errors: Array<{ taskId: string; reason: string }> = [];

    for (const taskId of input.taskIds) {
      try {
        await this.deleteTask(taskId);
        deleted++;
      } catch (error) {
        errors.push({
          taskId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      deleted,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Отменить задание
   */
  async cancelTask(id: string): Promise<CancelTaskResponse> {
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

    const [updatedTask] = await db
      .update(report6406Tasks)
      .set({
        status: ReportTaskStatus.CANCELLED,
        updatedAt: new Date(),
      })
      .where(eq(report6406Tasks.id, id))
      .returning();

    return {
      id: updatedTask.id,
      status: updatedTask.status,
      updatedAt: updatedTask.updatedAt.toISOString(),
    };
  }

  /**
   * Массовая отмена заданий
   */
  async bulkCancelTasks(input: BulkCancelTasksInput): Promise<BulkCancelResponse> {
    let cancelled = 0;
    const errors: Array<{ taskId: string; reason: string }> = [];

    for (const taskId of input.taskIds) {
      try {
        await this.cancelTask(taskId);
        cancelled++;
      } catch (error) {
        errors.push({
          taskId,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      cancelled,
      failed: errors.length,
      errors,
    };
  }

  /**
   * Проверка возможности отмены задания
   */
  private canCancel(status: string): boolean {
    return [ReportTaskStatus.PENDING, ReportTaskStatus.IN_PROGRESS].includes(status as ReportTaskStatus);
  }

  /**
   * Проверка возможности удаления задания
   */
  private canDelete(status: string): boolean {
    return status !== ReportTaskStatus.IN_PROGRESS;
  }

  /**
   * Проверка возможности добавления в пакет
   */
  canAddToPackage(status: string): boolean {
    return status === ReportTaskStatus.COMPLETED;
  }

  /**
   * Форматирование задания для API
   */
  private formatTask(task: typeof report6406Tasks.$inferSelect): Task {
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
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
      status: task.status,
      fileSize: task.fileSize,
      fileUrl: task.fileUrl,
      errorMessage: task.errorMessage,
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  /**
   * Форматирование задания для списка
   */
  private formatTaskListItem(task: typeof report6406Tasks.$inferSelect) {
    return {
      id: task.id,
      createdAt: task.createdAt.toISOString(),
      branchId: task.branchId,
      branchName: task.branchName,
      periodStart: task.periodStart,
      periodEnd: task.periodEnd,
      status: task.status,
      fileSize: task.fileSize,
      format: task.format,
      reportType: task.reportType,
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

export const tasksService = new TasksService();
