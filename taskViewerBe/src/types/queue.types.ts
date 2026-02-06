/**
 * Типы для системы очереди операций YouTrack
 */

export type QueueOperationType =
  | 'create_issue'
  | 'link_issue'
  | 'unlink_issue';

export type QueueOperationStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface BaseQueueOperation {
  id: string; // UUID операции
  type: QueueOperationType;
  status: QueueOperationStatus;
  createdAt: string; // ISO timestamp
  attempts: number; // Количество попыток выполнения
  lastAttemptAt?: string; // ISO timestamp последней попытки
  error?: string; // Сообщение об ошибке (если есть)
}

export interface CreateIssueOperation extends BaseQueueOperation {
  type: 'create_issue';
  data: {
    taskId: string;
    templateId: string;
    customFields?: Record<string, unknown>;
  };
  result?: {
    youtrackIssueId: string;
    youtrackIssueUrl: string;
  };
}

export interface LinkIssueOperation extends BaseQueueOperation {
  type: 'link_issue';
  data: {
    taskId: string;
    youtrackIssueId: string;
  };
  result?: {
    success: boolean;
  };
}

export interface UnlinkIssueOperation extends BaseQueueOperation {
  type: 'unlink_issue';
  data: {
    taskId: string;
    youtrackIssueId: string;
  };
  result?: {
    success: boolean;
  };
}

export type QueueOperation =
  | CreateIssueOperation
  | LinkIssueOperation
  | UnlinkIssueOperation;

export interface QueueManifest {
  operations: QueueOperation[];
}
