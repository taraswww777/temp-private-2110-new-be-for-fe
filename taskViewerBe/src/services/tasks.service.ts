import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { env } from '../config/env.js';
import type { Task, TaskManifest, TaskDetail } from '../types/task.types.js';
import type { UpdateTaskMetaInput } from '../schemas/tasks.schema.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const MANIFEST_PATH = join(TASKS_DIR, 'tasks-manifest.json');

export const tasksService = {
  /**
   * Получить все задачи из манифеста
   */
  async getAllTasks(): Promise<Task[]> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    // Обеспечиваем обратную совместимость: добавляем priority по умолчанию, если его нет
    return manifest.tasks.map(task => ({
      ...task,
      priority: task.priority || 'medium',
      youtrackIssueIds: task.youtrackIssueIds || undefined, // Сохраняем массив или undefined
    }));
  },

  /**
   * Получить задачу по ID с содержимым markdown файла
   */
  async getTaskById(id: string): Promise<TaskDetail | null> {
    const tasks = await this.getAllTasks();
    const task = tasks.find((t) => t.id === id);

    if (!task) {
      return null;
    }

    const mdPath = join(TASKS_DIR, task.file);
    const content = await readFile(mdPath, 'utf-8');

    return {
      ...task,
      priority: task.priority || 'medium', // Обеспечиваем обратную совместимость
      youtrackIssueIds: task.youtrackIssueIds || undefined,
      content,
    };
  },

  /**
   * Обновить метаданные задачи
   */
  async updateTaskMeta(id: string, updates: UpdateTaskMetaInput): Promise<Task | null> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);

    const taskIndex = manifest.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return null;
    }

    // Обновляем только переданные поля
    const updatedTask = {
      ...manifest.tasks[taskIndex],
      ...updates,
      // Обеспечиваем, что priority всегда присутствует
      priority: updates.priority || manifest.tasks[taskIndex].priority || 'medium',
    };

    manifest.tasks[taskIndex] = updatedTask;

    // Сохраняем обратно в файл
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    return updatedTask;
  },

  /**
   * Обновить статус в markdown файле (первая строка с эмодзи)
   */
  async updateTaskStatusInMarkdown(taskFile: string, newStatus: string): Promise<void> {
    const mdPath = join(TASKS_DIR, taskFile);
    let content = await readFile(mdPath, 'utf-8');

    // Маппинг статусов на эмодзи
    const statusEmojiMap: Record<string, string> = {
      'backlog': '📋 Бэклог',
      'planned': '📅 Запланировано',
      'in-progress': '⏳ В работе',
      'completed': '✅ Выполнено',
      'cancelled': '❌ Отменено',
    };

    const statusLine = statusEmojiMap[newStatus] || newStatus;

    // Заменяем строку со статусом (после ## Статус)
    content = content.replace(
      /(## Статус\n)(.+)/,
      `$1${statusLine}`
    );

    await writeFile(mdPath, content, 'utf-8');
  },
};
