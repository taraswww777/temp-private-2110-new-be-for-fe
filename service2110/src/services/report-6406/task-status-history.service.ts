import { db } from '../../db/index.js';
import { report6406TaskStatusHistory, report6406Tasks } from '../../db/schema/index.js';
import { eq, desc, sql } from 'drizzle-orm';
import type {
  StatusHistoryQuery,
  StatusHistoryResponse,
} from '../../schemas/report-6406/task-status-history.schema.js';
import type { TaskStatus } from '../../types/status-model.js';

export class TaskStatusHistoryService {
  /**
   * Получить историю статусов задания
   */
  async getTaskStatusHistory(taskId: string, query: StatusHistoryQuery): Promise<StatusHistoryResponse> {
    const { page, limit } = query;

    // Проверяем существование задания
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error(`Task with id '${taskId}' not found`);
    }

    // Подсчет общего количества записей в истории
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(report6406TaskStatusHistory)
      .where(eq(report6406TaskStatusHistory.taskId, taskId));

    // Получение истории с пагинацией (сортировка по changedAt DESC - сначала новые)
    const history = await db
      .select()
      .from(report6406TaskStatusHistory)
      .where(eq(report6406TaskStatusHistory.taskId, taskId))
      .orderBy(desc(report6406TaskStatusHistory.changedAt))
      .limit(limit)
      .offset(page * limit);

    return {
      taskId,
      history: history.map(item => ({
        id: item.id,
        status: item.status as TaskStatus,
        previousStatus: item.previousStatus as TaskStatus | null,
        changedAt: item.changedAt.toISOString(),
        changedBy: item.changedBy,
        comment: item.comment,
        metadata: item.metadata as Record<string, unknown> | null,
      })),
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}

export const taskStatusHistoryService = new TaskStatusHistoryService();
