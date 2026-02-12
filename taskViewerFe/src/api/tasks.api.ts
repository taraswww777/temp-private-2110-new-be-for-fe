import { ApiError } from '@/api/apiError';
import type { Task, TaskDetail, UpdateTaskMetaInput } from '@/types/task.types';

// Используем относительный путь - Vite dev server проксирует на http://localhost:3002
const API_BASE_URL = '/api';

export const tasksApi = {
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  async getTaskById(id: string): Promise<TaskDetail> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  async updateTaskMeta(id: string, updates: UpdateTaskMetaInput): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Метаданные тегов (цвета и предустановленный список цветов)
   */
  async getTagsMetadata(): Promise<{
    tags: Record<string, { color?: string }>;
    tagsWithId?: Array<{ id: string; name: string; color?: string }>;
    predefinedColors: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/tasks/tags/metadata`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Создать новый тег (добавить в источник истины; без привязки к задаче)
   */
  async createTag(name: string, color?: string): Promise<{ id: string; name: string; color?: string }> {
    const response = await fetch(`${API_BASE_URL}/tasks/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color: color || undefined }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Установить цвет для тега
   */
  async updateTagColor(
    tag: string,
    color: string
  ): Promise<{ tags: Record<string, { color?: string }> }> {
    const response = await fetch(`${API_BASE_URL}/tasks/tags/metadata`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag, color }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Переименовать тег во всех задачах
   */
  async renameTag(oldTag: string, newTag: string): Promise<{ updated: number }> {
    const response = await fetch(`${API_BASE_URL}/tasks/tags/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldTag, newTag }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Удалить тег из всех задач
   */
  async removeTagFromAllTasks(tag: string): Promise<{ updated: number }> {
    const response = await fetch(
      `${API_BASE_URL}/tasks/tags/${encodeURIComponent(tag)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Создать новую задачу
   */
  async createTask(input: {
    title: string;
    status?: 'backlog' | 'planned' | 'in-progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    content?: string;
    createdDate?: string | null;
    branch?: string | null;
    tags?: string[];
    project?: string | null;
  }): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Обновить содержимое задачи (markdown)
   */
  async updateTaskContent(id: string, content: string): Promise<TaskDetail> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },
};
