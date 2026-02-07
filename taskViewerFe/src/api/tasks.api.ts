import { ApiError } from '@/api/apiError';
import type { Task, TaskDetail, UpdateTaskMetaInput } from '@/types/task.types';

// Используем относительный путь - Vite dev server проксирует на http://localhost:3001
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
    predefinedColors: string[];
  }> {
    const response = await fetch(`${API_BASE_URL}/tasks/tags/metadata`);
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
};
