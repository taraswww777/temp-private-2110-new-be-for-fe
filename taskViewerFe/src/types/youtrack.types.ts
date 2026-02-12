/**
 * Типы для работы с YouTrack интеграцией
 */

export interface YouTrackIssueLink {
  localTaskId: string;
  youtrackIssueId: string; // Readable ID (например, "PROJ-123") — по нему и baseUrl из env собирается ссылка на фронте
  youtrackIssueUrl?: string; // опционально, фронт строит URL из baseUrl + youtrackIssueId
  youtrackData?: YouTrackIssueInfo;
}

// Информация о всех связях задачи
export interface TaskYouTrackLinks {
  localTaskId: string;
  youtrackIssueIds: string[]; // Массив readable ID задач в YouTrack
  links: YouTrackIssueLink[]; // Детальная информация о каждой связи
}

export interface YouTrackIssueInfo {
  /** idReadable (например VTB-538), приходит из GET /api/youtrack/issues/:id */
  idReadable?: string;
  summary: string;
  state?: string;
  priority?: string;
  assignee?: string;
}

export interface YouTrackTemplate {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  /** Родительская задача в YouTrack (idReadable, например VTB-100). Новая задача создаётся как подзадача. */
  parentIssueId?: string;
  summaryTemplate: string;
  descriptionTemplate: string;
  customFields?: Record<string, {
    $type: string;
    value: {
      name?: string;
      login?: string;
    };
  }>;
}

export interface CreateYouTrackTemplateInput {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  parentIssueId?: string;
  summaryTemplate: string;
  descriptionTemplate: string;
  customFields?: Record<string, {
    $type: string;
    value: {
      name?: string;
      login?: string;
    };
  }>;
}

export type UpdateYouTrackTemplateInput = Partial<CreateYouTrackTemplateInput>;

/** Данные операции очереди (связываемая задача и др.) */
export interface QueueOperationItemData {
  taskId: string;
  templateId?: string;
  youtrackIssueId?: string;
}

/** Элемент очереди операций YouTrack (краткий вид с API) */
export interface QueueOperationItem {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  attempts: number;
  data?: QueueOperationItemData;
}

/** Ответ GET /api/youtrack/queue */
export interface YouTrackQueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  operations: QueueOperationItem[];
}

/** Ответ POST /api/youtrack/queue/process */
export interface YouTrackQueueProcessResult {
  processed: number;
  failed: number;
  errors: Array<{ operationId: string; error: string }>;
}

export interface CreateIssueResponse {
  localTaskId: string;
  youtrackIssueId: string;
  youtrackIssueUrl: string;
  youtrackIssueIds: string[];
  queued?: boolean;
  operationId?: string;
}

export interface LinkIssueResponse {
  localTaskId: string;
  youtrackIssueId: string;
  youtrackIssueUrl: string;
  youtrackIssueIds: string[];
  queued?: boolean;
  operationId?: string;
}

export interface UnlinkIssueResponse {
  localTaskId: string;
  removedIssueId: string;
  youtrackIssueIds: string[];
  queued?: boolean;
  operationId?: string;
}
