import { ApiError } from '@/api/apiError';

const API_BASE_URL = '/api';

export interface Project {
  id: string;
  name: string;
}

export const projectsApi = {
  /**
   * Получить все проекты
   */
  async getAllProjects(): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Создать новый проект
   */
  async createProject(name: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Переименовать проект
   */
  async renameProject(id: string, newName: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },

  /**
   * Удалить проект из всех задач
   */
  async removeProject(id: string): Promise<{ updated: number }> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    return response.json();
  },
};
