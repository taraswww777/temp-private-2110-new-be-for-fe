import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { env } from '../config/env.js';
import type { Task, TaskManifest } from '../types/task.types.js';
import { tasksService } from './tasks.service.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const MANIFEST_PATH = join(TASKS_DIR, 'tasks-manifest.json');

/**
 * Сервис для работы со связями между локальными задачами и задачами YouTrack
 */
export const youtrackLinksService = {
  /**
   * Получить задачу из манифеста (для внутреннего использования)
   */
  async getTaskFromManifest(taskId: string): Promise<Task | null> {
    const tasks = await tasksService.getAllTasks();
    return tasks.find(t => t.id === taskId) || null;
  },

  /**
   * Добавить связь с задачей YouTrack
   */
  async addLink(taskId: string, youtrackIssueId: string): Promise<Task> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);

    const taskIndex = manifest.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with id "${taskId}" not found`);
    }

    const task = manifest.tasks[taskIndex];
    const existingIds = task.youtrackIssueIds || [];

    // Проверка на дублирование
    if (existingIds.includes(youtrackIssueId)) {
      throw new Error(`Link to YouTrack issue "${youtrackIssueId}" already exists`);
    }

    // Добавляем новый ID
    const updatedTask: Task = {
      ...task,
      youtrackIssueIds: [...existingIds, youtrackIssueId],
    };

    manifest.tasks[taskIndex] = updatedTask;

    // Атомарная запись манифеста
    await writeFile(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    return updatedTask;
  },

  /**
   * Удалить связь с задачей YouTrack
   */
  async removeLink(taskId: string, youtrackIssueId: string): Promise<Task> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);

    const taskIndex = manifest.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task with id "${taskId}" not found`);
    }

    const task = manifest.tasks[taskIndex];
    const existingIds = task.youtrackIssueIds || [];

    // Проверка существования связи
    if (!existingIds.includes(youtrackIssueId)) {
      throw new Error(`Link to YouTrack issue "${youtrackIssueId}" not found`);
    }

    // Удаляем ID
    const updatedIds = existingIds.filter(id => id !== youtrackIssueId);
    const updatedTask: Task = {
      ...task,
      youtrackIssueIds: updatedIds.length > 0 ? updatedIds : undefined,
    };

    manifest.tasks[taskIndex] = updatedTask;

    // Атомарная запись манифеста
    await writeFile(
      MANIFEST_PATH,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );

    return updatedTask;
  },

  /**
   * Получить все связи задачи
   */
  async getLinks(taskId: string): Promise<string[]> {
    const task = await this.getTaskFromManifest(taskId);
    if (!task) {
      throw new Error(`Task with id "${taskId}" not found`);
    }

    return task.youtrackIssueIds || [];
  },
};
