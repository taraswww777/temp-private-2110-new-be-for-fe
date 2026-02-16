import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { env } from '../config/env.ts';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const METADATA_PATH = join(TASKS_DIR, 'tags-metadata.json');

export interface TagRecord {
  name: string;
  color?: string;
}

/** Один тег с ID (для API и списков). */
export interface TagWithId extends TagRecord {
  id: string;
}

/** В файле: ключ = id, значение = { name, color? }. */
type TagsFileMap = Record<string, TagRecord>;

/** Валидные предустановленные цвета: серый + радуга (red, orange, yellow, green, blue, violet). */
export const PREDEFINED_COLORS = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'violet',
] as const;

export type TagColorKey = (typeof PREDEFINED_COLORS)[number];

function isValidColor(color: string): color is TagColorKey {
  return PREDEFINED_COLORS.includes(color as TagColorKey);
}

function normalizeColor(color: string | undefined): TagColorKey | undefined {
  return color && isValidColor(color) ? color : undefined;
}

/**
 * Сервис метаданных тегов.
 * Файл tags-metadata.json — единственный источник истины для тегов.
 * Формат: { "tags": { [tagId]: { "name": string, "color"?: string } } }.
 * В задачах в манифесте хранятся tagIds; имена резолвятся из этого файла.
 */
export const tagsMetadataService = {
  /**
   * Загрузить сырой объект тегов из файла (id -> { name, color? }).
   */
  async loadRaw(): Promise<TagsFileMap> {
    if (!existsSync(METADATA_PATH)) {
      return {};
    }
    const content = await readFile(METADATA_PATH, 'utf-8');
    const data = JSON.parse(content) as { tags?: unknown };
    if (!data.tags || typeof data.tags !== 'object' || Array.isArray(data.tags)) {
      return {};
    }
    const tags = data.tags as Record<string, unknown>;
    const result: TagsFileMap = {};
    for (const [key, val] of Object.entries(tags)) {
      if (val && typeof val === 'object' && typeof (val as TagRecord).name === 'string') {
        const rec = val as TagRecord;
        result[key] = {
          name: String(rec.name).trim(),
          ...(rec.color && isValidColor(rec.color) && { color: rec.color }),
        };
      }
    }
    return result;
  },

  /**
   * Проверить, новый ли формат (ключи = id, значение имеет name).
   * Старый формат: ключи = имена тегов, значение только { color? }.
   */
  async isNewFormat(): Promise<boolean> {
    if (!existsSync(METADATA_PATH)) return true;
    const content = await readFile(METADATA_PATH, 'utf-8');
    const data = JSON.parse(content) as { tags?: Record<string, unknown> };
    if (!data.tags || typeof data.tags !== 'object') return true;
    const first = Object.values(data.tags)[0];
    return first != null && typeof first === 'object' && 'name' in first;
  },

  /**
   * Миграция со старого формата (ключ = имя) на новый (ключ = id).
   */
  async migrateFromOldFormatIfNeeded(): Promise<void> {
    const isNew = await this.isNewFormat();
    if (isNew) return;

    const content = await readFile(METADATA_PATH, 'utf-8');
    const data = JSON.parse(content) as { tags?: Record<string, { color?: string }> };
    if (!data.tags || typeof data.tags !== 'object') return;

    const newTags: TagsFileMap = {};
    for (const [name, meta] of Object.entries(data.tags)) {
      const trimmed = String(name).trim();
      if (!trimmed) continue;
      const id = randomUUID();
      newTags[id] = {
        name: trimmed,
        ...(meta?.color && isValidColor(meta.color) && { color: meta.color }),
      };
    }
    await writeFile(
      METADATA_PATH,
      JSON.stringify({ tags: newTags }, null, 2),
      'utf-8'
    );
  },

  async saveRaw(tags: TagsFileMap): Promise<void> {
    await writeFile(
      METADATA_PATH,
      JSON.stringify({ tags }, null, 2),
      'utf-8'
    );
  },

  /**
   * Получить все теги (id, name, color) — источник истины для списка тегов.
   */
  async getAllTags(): Promise<TagWithId[]> {
    await this.migrateFromOldFormatIfNeeded();
    const raw = await this.loadRaw();
    return Object.entries(raw).map(([id, rec]) => ({
      id,
      name: rec.name,
      ...(rec.color && { color: rec.color }),
    }));
  },

  /**
   * Получить тег по ID.
   */
  async getTagById(id: string): Promise<TagRecord | null> {
    const raw = await this.loadRaw();
    return raw[id] ?? null;
  },

  /**
   * Найти ID тега по имени (без учёта регистра).
   */
  async getTagIdByName(name: string): Promise<string | null> {
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
   * Получить или создать тег по имени. Возвращает ID. При создании добавляет запись в файл.
   */
  async getOrCreateTagByName(name: string, color?: string): Promise<string> {
    await this.migrateFromOldFormatIfNeeded();
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Tag name cannot be empty');

    const existingId = await this.getTagIdByName(trimmed);
    if (existingId) return existingId;

    const raw = await this.loadRaw();
    const id = randomUUID();
    raw[id] = {
      name: trimmed,
      ...(color && isValidColor(color) && { color }),
    };
    await this.saveRaw(raw);
    return id;
  },

  /**
   * Установить цвет тега (по ID).
   */
  async setTagColorById(id: string, color: string): Promise<void> {
    const raw = await this.loadRaw();
    const rec = raw[id];
    if (!rec) return;
    const normalized = normalizeColor(color);
    if (normalized) {
      raw[id] = { ...rec, color: normalized };
    } else {
      const { color: _c, ...rest } = rec;
      raw[id] = Object.keys(rest).length > 0 ? rest : { name: rec.name };
    }
    await this.saveRaw(raw);
  },

  /**
   * Установить цвет тега по имени (для обратной совместимости API).
   */
  async setTagColorByName(name: string, color: string): Promise<void> {
    const id = await this.getTagIdByName(name);
    if (id) await this.setTagColorById(id, color);
  },

  /**
   * Переименовать тег (только в метаданных; в задачах хранятся id, менять не нужно).
   */
  async renameTagById(id: string, newName: string): Promise<void> {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('New tag name cannot be empty');
    const raw = await this.loadRaw();
    const rec = raw[id];
    if (!rec) throw new Error(`Tag id ${id} not found`);
    raw[id] = { ...rec, name: trimmed };
    await this.saveRaw(raw);
  },

  /**
   * Переименовать тег по старому имени (находит id, обновляет name в файле).
   */
  async renameTagByName(oldName: string, newName: string): Promise<void> {
    const id = await this.getTagIdByName(oldName);
    if (!id) return;
    await this.renameTagById(id, newName.trim());
  },

  /**
   * Удалить тег по ID (из метаданных). Задачи должен обновить вызывающий код.
   */
  async removeTagById(id: string): Promise<void> {
    const raw = await this.loadRaw();
    if (raw[id]) {
      delete raw[id];
      await this.saveRaw(raw);
    }
  },

  /**
   * Удалить тег по имени (находит id, удаляет из метаданных).
   */
  async removeTagByName(name: string): Promise<void> {
    const id = await this.getTagIdByName(name);
    if (id) await this.removeTagById(id);
  },

  /**
   * Резолв списка id в имена. Возвращает массив имён в том же порядке; неизвестные id пропускаются.
   */
  async resolveTagIdsToNames(tagIds: string[]): Promise<string[]> {
    if (tagIds.length === 0) return [];
    const raw = await this.loadRaw();
    const names: string[] = [];
    for (const id of tagIds) {
      const rec = raw[id];
      if (rec?.name) names.push(rec.name);
    }
    return names;
  },

  /**
   * Для обратной совместимости API: вернуть Record<tagName, { color? }> как раньше.
   */
  async getMetadataLegacy(): Promise<Record<string, { color?: string }>> {
    const all = await this.getAllTags();
    const result: Record<string, { color?: string }> = {};
    for (const t of all) {
      result[t.name] = t.color ? { color: t.color } : {};
    }
    return result;
  },
};
