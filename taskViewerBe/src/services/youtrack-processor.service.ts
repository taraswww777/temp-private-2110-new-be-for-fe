import { youtrackApiService } from './youtrack-api.service.js';
import { youtrackQueueService } from './youtrack-queue.service.js';
import { templatesService } from './templates.service.js';
import { youtrackLinksService } from './youtrack-links.service.js';
import { tasksService } from './tasks.service.js';
import { tagsBlacklistService } from './tags-blacklist.service.js';
import type {
  QueueOperation,
  CreateIssueOperation,
  LinkIssueOperation,
  UnlinkIssueOperation,
} from '../types/queue.types.js';
/**
 * Сервис для обработки очереди операций YouTrack
 */
export const youtrackProcessorService = {
  /**
   * Проверить доступность YouTrack (конфиг задан и YT не в режиме недоступности).
   * При false создание/связи сразу в очередь, запросы на YT не шлём.
   */
  isYouTrackAvailable(): boolean {
    return youtrackApiService.isConfigured() && !youtrackApiService.isUnavailable();
  },

  /**
   * Обработать одну операцию из очереди
   */
  async processOperation(operation: QueueOperation): Promise<void> {
    if (!this.isYouTrackAvailable()) {
      throw new Error('YouTrack is not configured');
    }

    try {
      // Обновляем статус на processing
      await youtrackQueueService.updateOperationStatus(operation.id, 'processing');

      switch (operation.type) {
        case 'create_issue':
          await this.processCreateIssue(operation as CreateIssueOperation);
          break;
        case 'link_issue':
          await this.processLinkIssue(operation as LinkIssueOperation);
          break;
        case 'unlink_issue':
          await this.processUnlinkIssue(operation as UnlinkIssueOperation);
          break;
        default:
          throw new Error(`Unknown operation type: ${(operation as QueueOperation).type}`);
      }

      // Обновляем статус на completed
      await youtrackQueueService.updateOperationStatus(
        operation.id,
        'completed',
        undefined,
        operation.result
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Если операция уже пыталась выполняться много раз, помечаем как failed
      const maxAttempts = 5;
      if (operation.attempts >= maxAttempts) {
        await youtrackQueueService.updateOperationStatus(
          operation.id,
          'failed',
          errorMessage
        );
      } else {
        // Возвращаем в pending для повторной попытки
        await youtrackQueueService.updateOperationStatus(
          operation.id,
          'pending',
          errorMessage
        );
      }
      throw error;
    }
  },

  /**
   * Обработать операцию создания задачи
   */
  async processCreateIssue(operation: CreateIssueOperation): Promise<void> {
    const { taskId, templateId, customFields } = operation.data;

    // Получаем локальную задачу
    const localTask = await tasksService.getTaskById(taskId);
    if (!localTask) {
      throw new Error(`Task with id "${taskId}" not found`);
    }

    // Применяем шаблон (в YT не подставляем номер задачи и ветку)
    const templateData = await templatesService.applyTemplateToTask(templateId, {
      taskId: '',
      title: localTask.title,
      content: localTask.content,
      status: localTask.status,
      branch: '',
    });

    // Получаем project ID
    const projectId = templateData.projectId === '0-0'
      ? await youtrackApiService.getProjectId()
      : templateData.projectId;

    // Применяем переопределения customFields, если есть
    const finalCustomFields = customFields
      ? Object.entries(customFields).map(([name, value]) => {
          if (typeof value === 'object' && value !== null && '$type' in value && 'value' in value) {
            const typedValue = value as { $type: string; value: { name?: string; login?: string } };
            return {
              name,
              $type: typedValue.$type,
              value: typedValue.value,
            };
          }
          const templateField = templateData.customFields.find(f => f.name === name);
          if (templateField) {
            return {
              ...templateField,
              value: typeof value === 'string' ? { name: value } : value as { name?: string; login?: string },
            };
          }
          return {
            name,
            $type: 'SingleEnumIssueCustomField',
            value: typeof value === 'string' ? { name: value } : value as { name?: string; login?: string },
          };
        })
      : templateData.customFields;

    const taskTags = localTask.tags ?? [];
    const tagsForYouTrack = await tagsBlacklistService.filterTagsForYouTrack(taskTags);
    const descriptionWithTags =
      tagsForYouTrack.length > 0
        ? `${templateData.description || ''}\n\nТеги: ${tagsForYouTrack.join(', ')}`
        : templateData.description;

    const createdIssue = await youtrackApiService.createIssue({
      project: { id: projectId },
      summary: templateData.summary,
      description: descriptionWithTags,
      customFields: finalCustomFields,
    });

    const issueId = createdIssue.idReadable ?? createdIssue.id;

    if (templateData.parentIssueId) {
      try {
        await youtrackApiService.applyCommand(
          [issueId],
          `subtask of ${templateData.parentIssueId}`
        );
      } catch (err) {
        console.error('Failed to link as subtask:', err);
      }
    }

    await youtrackLinksService.addLink(taskId, issueId);

    operation.result = {
      youtrackIssueId: issueId,
      youtrackIssueUrl: youtrackApiService.getIssueUrl(issueId),
    };
  },

  /**
   * Обработать операцию связывания задачи
   */
  async processLinkIssue(operation: LinkIssueOperation): Promise<void> {
    const { taskId, youtrackIssueId } = operation.data;

    // Проверяем существование задачи в YouTrack
    await youtrackApiService.getIssue(youtrackIssueId);

    // Добавляем связь
    await youtrackLinksService.addLink(taskId, youtrackIssueId);

    operation.result = { success: true };
  },

  /**
   * Обработать операцию удаления связи
   */
  async processUnlinkIssue(operation: UnlinkIssueOperation): Promise<void> {
    const { taskId, youtrackIssueId } = operation.data;

    // Удаляем связь
    await youtrackLinksService.removeLink(taskId, youtrackIssueId);

    operation.result = { success: true };
  },

  /**
   * Обработать все pending операции из очереди
   */
  async processPendingOperations(): Promise<{
    processed: number;
    failed: number;
    errors: Array<{ operationId: string; error: string }>;
  }> {
    if (!this.isYouTrackAvailable()) {
      return { processed: 0, failed: 0, errors: [] };
    }

    const pendingOps = await youtrackQueueService.getPendingOperations();
    const errors: Array<{ operationId: string; error: string }> = [];
    let processed = 0;
    let failed = 0;

    for (const operation of pendingOps) {
      try {
        await this.processOperation(operation);
        processed++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          operationId: operation.id,
          error: errorMessage,
        });
      }
    }

    return { processed, failed, errors };
  },
};
