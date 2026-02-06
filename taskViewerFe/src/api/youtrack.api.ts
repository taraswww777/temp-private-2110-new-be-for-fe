import { ApiError } from '@/api/apiError';
import type {
  YouTrackTemplate,
  CreateYouTrackTemplateInput,
  UpdateYouTrackTemplateInput,
  TaskYouTrackLinks,
  CreateIssueResponse,
  LinkIssueResponse,
  UnlinkIssueResponse,
  YouTrackIssueInfo,
  YouTrackQueueStatus,
  YouTrackQueueProcessResult,
} from '@/types/youtrack.types';

// Используем относительный путь - Vite dev server проксирует на http://localhost:3001
const API_BASE_URL = '/api';

/**
 * Собрать ссылку на задачу YouTrack по базовому URL (из env/API) и номеру задачи.
 * baseUrl приходит из GET /api/youtrack/config (читает YOUTRACK_URL из env на бэкенде).
 */
export function buildYouTrackIssueUrl(baseUrl: string | null, issueId: string): string | null {
  if (!baseUrl || !issueId) return null;
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/issue/${encodeURIComponent(issueId)}`;
}

export const youtrackApi = {
  /**
   * Создать задачу в YouTrack
   */
  async createIssue(
    taskId: string,
    templateId?: string,
    customFields?: Record<string, unknown>
  ): Promise<CreateIssueResponse> {
    const response = await fetch(`${API_BASE_URL}/youtrack/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        templateId: templateId || 'default',
        customFields,
      }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Связать с существующей задачей YouTrack
   */
  async linkIssue(taskId: string, youtrackIssueId: string): Promise<LinkIssueResponse> {
    const response = await fetch(`${API_BASE_URL}/youtrack/tasks/${taskId}/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        youtrackIssueId,
      }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Получить информацию о всех связях задачи
   */
  async getIssueLinks(taskId: string, includeDetails = false): Promise<TaskYouTrackLinks | null> {
    let url = `${API_BASE_URL}/youtrack/tasks/${taskId}`;
    if (includeDetails) {
      url += '?includeDetails=true';
    }
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Удалить конкретную связь
   */
  async unlinkIssue(taskId: string, youtrackIssueId: string): Promise<UnlinkIssueResponse> {
    const response = await fetch(`${API_BASE_URL}/youtrack/tasks/${taskId}/link/${youtrackIssueId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Получить информацию о задаче из YouTrack
   */
  async getIssueInfo(_youtrackIssueId: string): Promise<YouTrackIssueInfo> {
    // Используем getIssueLinks с includeDetails для получения информации
    // Но нам нужен taskId, поэтому лучше использовать прямой запрос к YouTrack API через бэкенд
    // Пока используем getIssueLinks, но это не оптимально
    throw new Error('getIssueInfo requires taskId. Use getIssueLinks instead.');
  },

  /**
   * Получить все шаблоны
   */
  async getTemplates(): Promise<YouTrackTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/youtrack/templates`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Получить шаблон по ID
   */
  async getTemplate(templateId: string): Promise<YouTrackTemplate> {
    const response = await fetch(`${API_BASE_URL}/youtrack/templates/${templateId}`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Создать шаблон
   */
  async createTemplate(template: CreateYouTrackTemplateInput): Promise<YouTrackTemplate> {
    const response = await fetch(`${API_BASE_URL}/youtrack/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Обновить шаблон
   */
  async updateTemplate(
    templateId: string,
    template: UpdateYouTrackTemplateInput
  ): Promise<YouTrackTemplate> {
    const response = await fetch(`${API_BASE_URL}/youtrack/templates/${templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Удалить шаблон
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/youtrack/templates/${templateId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
  },

  /**
   * Получить конфигурацию YouTrack (базовый URL для ссылок на задачи)
   */
  async getConfig(): Promise<{ baseUrl: string | null }> {
    const response = await fetch(`${API_BASE_URL}/youtrack/config`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Получить статус очереди операций YouTrack
   */
  async getQueueStatus(): Promise<YouTrackQueueStatus> {
    const response = await fetch(`${API_BASE_URL}/youtrack/queue`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Запустить обработку очереди вручную
   */
  async processQueue(): Promise<YouTrackQueueProcessResult> {
    const response = await fetch(`${API_BASE_URL}/youtrack/queue/process`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },
};
