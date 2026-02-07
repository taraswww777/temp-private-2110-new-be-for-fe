import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { env } from '../config/env.js';
import { tagsMetadataService } from './tags-metadata.service.js';
import type { Task, TaskManifest, TaskDetail, TaskInManifest } from '../types/task.types.js';
import type { UpdateTaskMetaInput } from '../schemas/tasks.schema.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const MANIFEST_PATH = join(TASKS_DIR, 'tasks-manifest.json');

/** Оставляет только валидные строковые ID (отсекает null/undefined из манифеста). */
function normalizeYoutrackIssueIds(ids: unknown[] | undefined): string[] | undefined {
  if (!ids || !Array.isArray(ids)) return undefined;
  const filtered = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  return filtered.length > 0 ? filtered : undefined;
}

/** Нормализация tagIds — только непустые строки. */
function normalizeTagIds(ids: unknown[] | undefined): string[] | undefined {
  if (!ids || !Array.isArray(ids)) return undefined;
  const filtered = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Преобразовать задачу из манифеста в Task для API: резолв tagIds -> names.
 */
async function manifestTaskToApiTask(row: TaskInManifest): Promise<Task> {
  const tagIds = normalizeTagIds(row.tagIds);
  const tags = tagIds?.length
    ? await tagsMetadataService.resolveTagIdsToNames(tagIds)
    : undefined;
  return {
    ...row,
    priority: row.priority || 'medium',
    youtrackIssueIds: normalizeYoutrackIssueIds(row.youtrackIssueIds),
    tags,
  };
}

export const tasksService = {
  /**
   * Получить все задачи. Теги в манифесте хранятся как tagIds; в ответе — имена (tags).
   */
  async getAllTasks(): Promise<Task[]> {
    await tagsMetadataService.migrateFromOldFormatIfNeeded();
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    let manifestDirty = false;

    const result: Task[] = [];
    for (const row of manifest.tasks) {
      let tagIds = normalizeTagIds(row.tagIds);
      // Миграция: если в задаче ещё старый формат (tags по именам), конвертируем в tagIds
      if (Array.isArray(row.tags) && row.tags.length > 0 && (!tagIds || tagIds.length === 0)) {
        tagIds = [];
        for (const name of row.tags) {
          const t = String(name).trim();
          if (t) tagIds.push(await tagsMetadataService.getOrCreateTagByName(t));
        }
        (row as TaskInManifest).tagIds = tagIds.length > 0 ? tagIds : undefined;
        delete (row as TaskInManifest).tags;
        manifestDirty = true;
      }
      const task = await manifestTaskToApiTask(row);
      result.push(task);
    }

    if (manifestDirty) {
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
    }

    return result;
  },

  /**
   * Получить задачу по ID с содержимым markdown файла
   */
  async getTaskById(id: string): Promise<TaskDetail | null> {
    const tasks = await this.getAllTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    const mdPath = join(TASKS_DIR, task.file);
    const content = await readFile(mdPath, 'utf-8');
    return { ...task, content };
  },

  /**
   * Обновить метаданные задачи. При передаче tags (имена) резолвим в tagIds и сохраняем в манифесте только tagIds.
   */
  async updateTaskMeta(id: string, updates: UpdateTaskMetaInput): Promise<Task | null> {
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    const taskIndex = manifest.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return null;

    const row = manifest.tasks[taskIndex];
    let updatedRow: TaskInManifest = {
      ...row,
      priority: updates.priority ?? row.priority ?? 'medium',
    };

    if (updates.tags !== undefined) {
      const tagIds: string[] = [];
      for (const name of updates.tags) {
        const t = String(name).trim();
        if (t) tagIds.push(await tagsMetadataService.getOrCreateTagByName(t));
      }
      updatedRow.tagIds = tagIds.length > 0 ? tagIds : undefined;
      delete updatedRow.tags;
    } else {
      updatedRow = { ...updatedRow, tagIds: row.tagIds };
      delete (updatedRow as Record<string, unknown>).tags;
    }

    if (updates.title !== undefined) updatedRow.title = updates.title;
    if (updates.status !== undefined) updatedRow.status = updates.status;
    if (updates.createdDate !== undefined) updatedRow.createdDate = updates.createdDate;
    if (updates.completedDate !== undefined) updatedRow.completedDate = updates.completedDate;
    if (updates.branch !== undefined) updatedRow.branch = updates.branch;

    manifest.tasks[taskIndex] = updatedRow;
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    return manifestTaskToApiTask(updatedRow);
  },

  /**
   * Обновить статус в markdown файле (первая строка с эмодзи)
   */
  async updateTaskStatusInMarkdown(taskFile: string, newStatus: string): Promise<void> {
    const mdPath = join(TASKS_DIR, taskFile);
    let content = await readFile(mdPath, 'utf-8');
    const statusEmojiMap: Record<string, string> = {
      backlog: '📋 Бэклог',
      planned: '📅 Запланировано',
      'in-progress': '⏳ В работе',
      completed: '✅ Выполнено',
      cancelled: '❌ Отменено',
    };
    const statusLine = statusEmojiMap[newStatus] || newStatus;
    content = content.replace(/(## Статус\n)(.+)/, `$1${statusLine}`);
    await writeFile(mdPath, content, 'utf-8');
  },

  /**
   * Переименовать тег. Меняется только имя в tags-metadata.json; в задачах хранятся id, менять не нужно.
   */
  async renameTagInAllTasks(oldTag: string, newTag: string): Promise<number> {
    const oldTrimmed = oldTag.trim();
    const newTrimmed = newTag.trim();
    if (!oldTrimmed || !newTrimmed || oldTrimmed === newTrimmed) return 0;
    await tagsMetadataService.renameTagByName(oldTrimmed, newTrimmed);
    return 1; // один тег переименован в источнике истины
  },

  /**
   * Удалить тег: сначала из метаданных, затем id из всех задач в манифесте.
   */
  async removeTagFromAllTasks(tagName: string): Promise<number> {
    const trimmed = tagName.trim();
    if (!trimmed) return 0;

    const tagId = await tagsMetadataService.getTagIdByName(trimmed);
    if (!tagId) return 0;

    await tagsMetadataService.removeTagById(tagId);

    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    let updated = 0;

    for (let i = 0; i < manifest.tasks.length; i++) {
      const row = manifest.tasks[i];
      const tagIds = Array.isArray(row.tagIds) ? row.tagIds.filter((id) => id !== tagId) : [];
      if (tagIds.length !== (row.tagIds?.length ?? 0)) {
        manifest.tasks[i] = { ...row, tagIds: tagIds.length > 0 ? tagIds : undefined };
        delete (manifest.tasks[i] as TaskInManifest).tags;
        updated++;
      }
    }

    if (updated > 0) {
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
    }
    return updated;
  },
};
