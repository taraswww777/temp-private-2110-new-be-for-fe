import { env } from '../config/env.js';
import type {
  YouTrackProject,
  YouTrackIssue,
  YouTrackCreateIssueRequest,
  YouTrackCreateIssueResponse,
} from '../types/youtrack.types.js';

/**
 * Сервис для работы с YouTrack REST API
 */
export class YouTrackApiService {
  private baseUrl?: string;
  private token?: string;
  private projectId?: string;

  /**
   * Проверка доступности YouTrack
   */
  private checkAvailability(): void {
    if (!env.YOUTRACK_URL || !env.YOUTRACK_TOKEN) {
      throw new Error('YouTrack is not configured. Please set YOUTRACK_URL and YOUTRACK_TOKEN environment variables.');
    }
    // Инициализируем значения при первом использовании
    if (!this.baseUrl || !this.token) {
      this.baseUrl = env.YOUTRACK_URL.replace(/\/$/, ''); // Убираем trailing slash
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
        throw new Error(
          `YouTrack API error: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      // Если ответ пустой (например, для DELETE), возвращаем пустой объект
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        return json as T;
      }
      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        // Перехватываем сетевые ошибки
        if (error.message.includes('fetch')) {
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
   * Получить информацию о задаче
   */
  async getIssue(issueId: string): Promise<YouTrackIssue> {
    const response = await this.request<YouTrackIssue>(`/issues/${issueId}`);
    return response;
  }

  /**
   * Создать новую задачу в YouTrack
   */
  async createIssue(data: YouTrackCreateIssueRequest): Promise<YouTrackCreateIssueResponse> {
    const response = await this.request<YouTrackCreateIssueResponse>(
      '/issues',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response;
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
