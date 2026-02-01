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
};
