import { db } from '../../db/index.js';
import { report6406TaskStatusHistory, report6406Tasks } from '../../db/schema/index.js';
import { eq, desc } from 'drizzle-orm';
import type {
  StatusHistoryResponse,
} from '../../schemas/report-6406/task-status-history.schema.js';
import type { TaskStatus } from '../../types/status-model.js';

export class TaskStatusHistoryService {
  /**
   * Получить полную историю статусов задания (без пагинации)
   */
  async getTaskStatusHistory(taskId: string): Promise<StatusHistoryResponse> {
    // Проверяем существование задания
    const [task] = await db
      .select()
      .from(report6406Tasks)
      .where(eq(report6406Tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error(`Task with id '${taskId}' not found`);
    }

    // Получение всей истории (сортировка по changedAt DESC - сначала новые)
    const history = await db
      .select()
      .from(report6406TaskStatusHistory)
      .where(eq(report6406TaskStatusHistory.taskId, taskId))
      .orderBy(desc(report6406TaskStatusHistory.changedAt));

    return history.map(item => ({
      id: item.id,
      status: item.status as TaskStatus,
      previousStatus: item.previousStatus as TaskStatus | null,
      changedAt: item.changedAt.toISOString(),
      changedBy: item.changedBy,
      comment: item.comment,
      metadata: item.metadata as Record<string, unknown> | null,
    }));
  }
}

export const taskStatusHistoryService = new TaskStatusHistoryService();
