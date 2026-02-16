import { env } from '../config/env.ts';
import type {
  YouTrackProject,
  YouTrackIssue,
  YouTrackCreateIssueRequest,
  YouTrackCreateIssueResponse,
} from '../types/youtrack.types.ts';

/** Время, на которое считаем YT недоступным после ошибки (мс) */
const UNAVAILABLE_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Сервис для работы с YouTrack REST API.
 * При ошибке соединения или 5xx помечает YT как недоступный — дальше запросы не шлём, операции в очередь.
 */
export class YouTrackApiService {
  private baseUrl?: string;
  private token?: string;
  private projectId?: string;
  private unavailableUntil = 0;

  /** Пометить YT как недоступный на заданное время. */
  setUnavailableFor(ms: number): void {
    this.unavailableUntil = Date.now() + ms;
  }

  /** YT в режиме недоступности (после ошибки соединения/5xx). */
  isUnavailable(): boolean {
    return Date.now() < this.unavailableUntil;
  }

  /** Заданы ли URL и токен. */
  isConfigured(): boolean {
    return !!(env.YOUTRACK_URL && env.YOUTRACK_TOKEN);
  }

  private checkAvailability(): void {
    if (!this.isConfigured()) {
      throw new Error('YouTrack is not configured. Please set YOUTRACK_URL and YOUTRACK_TOKEN environment variables.');
    }
    if (this.isUnavailable()) {
      throw new Error('YouTrack is temporarily unavailable. Operations are being queued.');
    }
    if (!this.baseUrl || !this.token) {
      this.baseUrl = env.YOUTRACK_URL!.replace(/\/$/, '');
      this.token = env.YOUTRACK_TOKEN;
      this.projectId = env.YOUTRACK_PROJECT_ID;
    }
  }

  /**
   * Выполнить запрос к YouTrack API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    this.checkAvailability();

      const url = `${this.baseUrl!}/api${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.token!}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        if (response.status >= 500) {
          this.setUnavailableFor(UNAVAILABLE_COOLDOWN_MS);
        }
        throw new Error(
          `YouTrack API error: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      this.unavailableUntil = 0;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        return json as T;
      }
      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        const isConnectionError =
          error.message.includes('fetch') ||
          error.message.includes('Failed to connect') ||
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ENOTFOUND');
        if (isConnectionError) {
          this.setUnavailableFor(UNAVAILABLE_COOLDOWN_MS);
          throw new Error(
            `Failed to connect to YouTrack at ${this.baseUrl}. Please check your network connection and VPN.`
          );
        }
        throw error;
      }
      throw new Error('Unknown error occurred while calling YouTrack API');
    }
  }

  /**
   * Получить список проектов
   */
  async getProjects(): Promise<YouTrackProject[]> {
    const response = await this.request<{ id: string; name: string; shortName: string }[]>(
      '/admin/projects'
    );
    return response;
  }

  /**
   * Получить информацию о задаче.
   * @param fields — при указании запрашиваются нужные поля (иначе API возвращает только id и $type)
   */
  async getIssue(issueId: string, fields?: string): Promise<YouTrackIssue> {
    const endpoint = fields
      ? `/issues/${encodeURIComponent(issueId)}?fields=${encodeURIComponent(fields)}`
      : `/issues/${encodeURIComponent(issueId)}`;
    const response = await this.request<YouTrackIssue>(endpoint);
    return response;
  }

  /**
   * Получить idReadable (VTB-538) по внутреннему id (3-994).
   * Ответ POST /api/issues часто содержит только id, без idReadable.
   */
  async getIssueIdReadable(internalId: string): Promise<string> {
    const issue = await this.request<{ idReadable?: string; id: string }>(
      `/issues/${internalId}?fields=idReadable,id`
    );
    return issue.idReadable ?? issue.id;
  }

  /**
   * Создать новую задачу в YouTrack.
   * После создания при необходимости запрашивает idReadable (VTB-538), чтобы в манифест писать его, а не внутренний id (3-994).
   */
  async createIssue(data: YouTrackCreateIssueRequest): Promise<YouTrackCreateIssueResponse> {
    const response = await this.request<YouTrackCreateIssueResponse>(
      '/issues',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (!response.idReadable) {
      response.idReadable = await this.getIssueIdReadable(response.id);
    }

    return response;
  }

  /**
   * Применить команду к задачам (например, "subtask of VTB-100" для привязки к родителю).
   * POST /api/commands
   */
  async applyCommand(issueIds: string[], query: string): Promise<void> {
    if (issueIds.length === 0 || !query.trim()) return;
    await this.request<unknown>('/commands', {
      method: 'POST',
      body: JSON.stringify({
        query: query.trim(),
        issues: issueIds.map((id) => ({ idReadable: id })),
      }),
    });
  }

  /**
   * Получить URL задачи в YouTrack
   */
  getIssueUrl(issueId: string): string {
    this.checkAvailability();
    return `${this.baseUrl!}/issue/${issueId}`;
  }

  /**
   * Получить project ID (из конфигурации или первый доступный проект)
   */
  async getProjectId(): Promise<string> {
    this.checkAvailability();
    if (this.projectId) {
      return this.projectId;
    }

    // Если project ID не указан, получаем первый доступный проект
    const projects = await this.getProjects();
    if (projects.length === 0) {
      throw new Error('No projects found in YouTrack');
    }
    return projects[0].id;
  }
}

// Экспортируем singleton экземпляр
export const youtrackApiService = new YouTrackApiService();
