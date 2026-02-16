import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { env } from '../config/env.ts';
import { tagsMetadataService } from './tags-metadata.service.ts';
import { projectsMetadataService } from './projects-metadata.service.ts';
import type { Task, TaskManifest, TaskDetail, TaskInManifest } from '../types/task.types.ts';
import type { UpdateTaskMetaInput, CreateTaskInput } from '../schemas/tasks.schema.ts';
import { TaskStatusEnum } from '../types/taskStatusEnum.ts';

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
 * Преобразовать задачу из манифеста в Task для API: резолв tagIds -> names, projectId -> name.
 */
async function manifestTaskToApiTask(row: TaskInManifest): Promise<Task> {
  const tagIds = normalizeTagIds(row.tagIds);
  const tags = tagIds?.length
    ? await tagsMetadataService.resolveTagIdsToNames(tagIds)
    : undefined;
  const project = row.projectId
    ? await projectsMetadataService.resolveProjectIdToName(row.projectId)
    : null;
  return {
    ...row,
    priority: row.priority || 'medium',
    youtrackIssueIds: normalizeYoutrackIssueIds(row.youtrackIssueIds),
    tags,
    project,
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
   * При передаче project (имя) резолвим в projectId и сохраняем в манифесте только projectId.
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
      delete (updatedRow as unknown as Record<string, unknown>).tags;
    }

    if (updates.project !== undefined) {
      if (updates.project === null || updates.project === '') {
        updatedRow.projectId = null;
      } else {
        const projectName = String(updates.project).trim();
        if (projectName) {
          updatedRow.projectId = await projectsMetadataService.getOrCreateProjectByName(projectName);
        } else {
          updatedRow.projectId = null;
        }
      }
    } else {
      updatedRow.projectId = row.projectId;
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
   * Генерировать следующий доступный ID задачи (TASK-001, TASK-002 и т.д.)
   */
  async getNextTaskId(): Promise<string> {
    const tasks = await this.getAllTasks();
    const existingIds = tasks.map((t) => t.id);
    let nextNum = 1;

    while (true) {
      const candidateId = `TASK-${String(nextNum).padStart(3, '0')}`;
      if (!existingIds.includes(candidateId)) {
        return candidateId;
      }
      nextNum++;
      // Защита от бесконечного цикла
      if (nextNum > 9999) {
        throw new Error('Превышен лимит количества задач');
      }
    }
  },

  /**
   * Создать slug из названия задачи для имени файла
   */
  createSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Удалить спецсимволы
      .replace(/\s+/g, '-') // Заменить пробелы на дефисы
      .replace(/-+/g, '-') // Убрать множественные дефисы
      .replace(/^-|-$/g, ''); // Убрать дефисы в начале и конце
  },

  /**
   * Создать шаблон содержимого задачи в формате Markdown
   */
  createTaskMarkdownTemplate(
    id: string,
    title: string,
    status: TaskStatusEnum,
    content: string,
    slug: string
  ): string {
    const statusEmojiMap: Record<TaskStatusEnum, string> = {
      [TaskStatusEnum.backlog]: '📋 Бэклог',
      [TaskStatusEnum.planned]: '📅 Запланировано',
      [TaskStatusEnum.inProgress]: '⏳ В работе',
      [TaskStatusEnum.completed]: '✅ Выполнено',
      [TaskStatusEnum.cancelled]: '❌ Отменено',
    };
    const statusLine = statusEmojiMap[status] || status;

    return `# ${id}: ${title}

**Статус**: ${statusLine}  
**Ветка**: \`feature/${id.toLowerCase()}-${slug}\` (при необходимости)  
**Приоритет**: средний  

---

## Краткое описание

${content || 'Описание задачи...'}

---

## Контекст

_(добавьте контекст задачи здесь)_

---

## Цели

- [ ] Цель 1
- [ ] Цель 2

---

## Критерии приёмки

- [ ] Критерий 1
- [ ] Критерий 2

---

## Технические заметки

_(добавьте технические заметки здесь)_

---

## Уточнения в процессе выполнения

_(здесь будут добавляться уточнения, выявленные в процессе работы)_
`;
  },

  /**
   * Создать новую задачу
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const id = await this.getNextTaskId();
    const slug = this.createSlugFromTitle(input.title);
    const fileName = `${id}-${slug}.md`;
    const filePath = join(TASKS_DIR, fileName);

    // Проверить, что файл не существует
    if (existsSync(filePath)) {
      throw new Error(`Файл ${fileName} уже существует`);
    }

    // Создать содержимое файла
    const markdownContent = this.createTaskMarkdownTemplate(
      id,
      input.title,
      input.status,
      input.content,
      slug
    );

    // Создать файл Markdown
    await writeFile(filePath, markdownContent, 'utf-8');

    // Добавить запись в манифест
    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);

    // Резолвить теги в tagIds
    const tagIds: string[] = [];
    if (input.tags && input.tags.length > 0) {
      for (const name of input.tags) {
        const t = String(name).trim();
        if (t) tagIds.push(await tagsMetadataService.getOrCreateTagByName(t));
      }
    }

    // Резолвить проект в projectId
    let projectId: string | null = null;
    if (input.project && input.project.trim()) {
      projectId = await projectsMetadataService.getOrCreateProjectByName(input.project.trim());
    }

    const newTask: TaskInManifest = {
      id,
      title: input.title,
      status: input.status,
      priority: input.priority,
      file: fileName,
      createdDate: input.createdDate || new Date().toISOString(),
      completedDate: null,
      branch: input.branch || null,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      projectId,
    };

    manifest.tasks.push(newTask);
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    return manifestTaskToApiTask(newTask);
  },

  /**
   * Обновить содержимое задачи (markdown файл)
   */
  async updateTaskContent(id: string, content: string): Promise<TaskDetail | null> {
    const tasks = await this.getAllTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return null;

    const mdPath = join(TASKS_DIR, task.file);
    await writeFile(mdPath, content, 'utf-8');

    return { ...task, content };
  },

  /**
   * Обновить статус в markdown файле (первая строка с эмодзи)
   */
  async updateTaskStatusInMarkdown(taskFile: string, newStatus: TaskStatusEnum): Promise<void> {
    const mdPath = join(TASKS_DIR, taskFile);
    let content = await readFile(mdPath, 'utf-8');
    const statusEmojiMap: Record<TaskStatusEnum, string> = {
      [TaskStatusEnum.backlog]: '📋 Бэклог',
      [TaskStatusEnum.planned]: '📅 Запланировано',
      [TaskStatusEnum.inProgress]: '⏳ В работе',
      [TaskStatusEnum.completed]: '✅ Выполнено',
      [TaskStatusEnum.cancelled]: '❌ Отменено',
    };
    const statusLine = statusEmojiMap[newStatus] || newStatus;
    content = content.replace(/(\*\*Статус\*\*: )(.+)/, `$1${statusLine}`);
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

  /**
   * Удалить проект: сначала из метаданных, затем projectId из всех задач в манифесте.
   */
  async removeProjectFromAllTasks(projectId: string): Promise<number> {
    if (!projectId) return 0;

    await projectsMetadataService.removeProjectById(projectId);

    const content = await readFile(MANIFEST_PATH, 'utf-8');
    const manifest: TaskManifest = JSON.parse(content);
    let updated = 0;

    for (let i = 0; i < manifest.tasks.length; i++) {
      const row = manifest.tasks[i];
      if (row.projectId === projectId) {
        manifest.tasks[i] = { ...row, projectId: null };
        updated++;
      }
    }

    if (updated > 0) {
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
    }
    return updated;
  },
};
