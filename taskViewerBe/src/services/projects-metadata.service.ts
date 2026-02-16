import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env.ts';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const METADATA_PATH = join(TASKS_DIR, 'projects-metadata.json');

export interface ProjectRecord {
  name: string;
}

/** Один проект с ID (для API и списков). */
export interface ProjectWithId extends ProjectRecord {
  id: string;
}

/** В файле: ключ = id, значение = { name }. */
type ProjectsFileMap = Record<string, ProjectRecord>;

/**
 * Сервис метаданных проектов.
 * Файл projects-metadata.json — единственный источник истины для проектов.
 * Формат: { "projects": { [projectId]: { "name": string } } }.
 * В задачах в манифесте хранятся projectId; имена резолвятся из этого файла.
 */
export const projectsMetadataService = {
  /**
   * Загрузить сырой объект проектов из файла (id -> { name }).
   */
  async loadRaw(): Promise<ProjectsFileMap> {
    if (!existsSync(METADATA_PATH)) {
      return {};
    }
    const content = await readFile(METADATA_PATH, 'utf-8');
    const data = JSON.parse(content) as { projects?: unknown };
    if (!data.projects || typeof data.projects !== 'object' || Array.isArray(data.projects)) {
      return {};
    }
    const projects = data.projects as Record<string, unknown>;
    const result: ProjectsFileMap = {};
    for (const [key, val] of Object.entries(projects)) {
      if (val && typeof val === 'object' && typeof (val as ProjectRecord).name === 'string') {
        const rec = val as ProjectRecord;
        result[key] = {
          name: String(rec.name).trim(),
        };
      }
    }
    return result;
  },

  async saveRaw(projects: ProjectsFileMap): Promise<void> {
    await writeFile(
      METADATA_PATH,
      JSON.stringify({ projects }, null, 2),
      'utf-8'
    );
  },

  /**
   * Получить все проекты (id, name) — источник истины для списка проектов.
   */
  async getAllProjects(): Promise<ProjectWithId[]> {
    const raw = await this.loadRaw();
    return Object.entries(raw).map(([id, rec]) => ({
      id,
      name: rec.name,
    }));
  },

  /**
   * Получить проект по ID.
   */
  async getProjectById(id: string): Promise<ProjectRecord | null> {
    const raw = await this.loadRaw();
    return raw[id] ?? null;
  },

  /**
   * Найти ID проекта по имени (без учёта регистра).
   */
  async getProjectIdByName(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const raw = await this.loadRaw();
    const lower = trimmed.toLowerCase();
    for (const [id, rec] of Object.entries(raw)) {
      if (rec.name.toLowerCase() === lower) return id;
    }
    return null;
  },

  /**
   * Получить или создать проект по имени. Возвращает ID. При создании добавляет запись в файл.
   */
  async getOrCreateProjectByName(name: string): Promise<string> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Project name cannot be empty');

    const existingId = await this.getProjectIdByName(trimmed);
    if (existingId) return existingId;

    const raw = await this.loadRaw();
    const id = randomUUID();
    raw[id] = {
      name: trimmed,
    };
    await this.saveRaw(raw);
    return id;
  },

  /**
   * Переименовать проект (только в метаданных; в задачах хранятся id, менять не нужно).
   */
  async renameProjectById(id: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('New project name cannot be empty');
    const raw = await this.loadRaw();
    const rec = raw[id];
    if (!rec) throw new Error(`Project id ${id} not found`);
    raw[id] = { ...rec, name: trimmed };
    await this.saveRaw(raw);
  },

  /**
   * Удалить проект по ID (из метаданных). Задачи должен обновить вызывающий код.
   */
  async removeProjectById(id: string): Promise<void> {
    const raw = await this.loadRaw();
    if (raw[id]) {
      delete raw[id];
      await this.saveRaw(raw);
    }
  },

  /**
   * Резолв id в имя. Возвращает имя или null если проект не найден.
   */
  async resolveProjectIdToName(projectId: string | null | undefined): Promise<string | null> {
    if (!projectId) return null;
    const rec = await this.getProjectById(projectId);
    return rec?.name ?? null;
  },
};
