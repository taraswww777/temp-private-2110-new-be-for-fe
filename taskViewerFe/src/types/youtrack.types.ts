/**
 * Типы для работы с YouTrack интеграцией
 */

export interface YouTrackIssueLink {
  localTaskId: string;
  youtrackIssueId: string; // Readable ID (например, "PROJ-123")
  youtrackIssueUrl: string;
  youtrackData?: YouTrackIssueInfo;
}

// Информация о всех связях задачи
export interface TaskYouTrackLinks {
  localTaskId: string;
  youtrackIssueIds: string[]; // Массив readable ID задач в YouTrack
  links: YouTrackIssueLink[]; // Детальная информация о каждой связи
}

export interface YouTrackIssueInfo {
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
