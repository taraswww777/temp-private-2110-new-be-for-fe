import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { env } from '../config/env.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const METADATA_PATH = join(TASKS_DIR, 'tags-metadata.json');

export interface TagMetadata {
  color?: string;
}

/** Валидные предустановленные цвета (ключи для фронта). */
export const PREDEFINED_COLORS = [
  'gray',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
] as const;

export type TagColorKey = (typeof PREDEFINED_COLORS)[number];

function isValidColor(color: string): color is TagColorKey {
  return PREDEFINED_COLORS.includes(color as TagColorKey);
}

/**
 * Сервис метаданных тегов (цвет и др.).
 * Хранит настройки в docs/tasks/tags-metadata.json.
 */
export const tagsMetadataService = {
  /**
   * Получить метаданные всех тегов: { tagName: { color?: string } }
   */
  async getMetadata(): Promise<Record<string, TagMetadata>> {
    if (!existsSync(METADATA_PATH)) {
      return {};
    }
    const content = await readFile(METADATA_PATH, 'utf-8');
    const data = JSON.parse(content) as { tags?: Record<string, TagMetadata> };
    if (!data.tags || typeof data.tags !== 'object') {
      return {};
    }
    const result: Record<string, TagMetadata> = {};
    for (const [tag, meta] of Object.entries(data.tags)) {
      if (typeof meta === 'object' && meta !== null) {
        result[tag] = {
          ...(meta.color && isValidColor(meta.color) && { color: meta.color }),
        };
      }
    }
    return result;
  },

  /**
   * Установить цвет для тега
   */
  async setTagColor(tag: string, color: string): Promise<Record<string, TagMetadata>> {
    const trimmed = tag.trim();
    if (!trimmed) return this.getMetadata();
    const normalizedColor = isValidColor(color) ? color : undefined;

    const tags = await this.getMetadata();
    if (normalizedColor) {
      tags[trimmed] = { ...tags[trimmed], color: normalizedColor };
    } else {
      if (tags[trimmed]) {
        const { color: _c, ...rest } = tags[trimmed];
        if (Object.keys(rest).length > 0) {
          tags[trimmed] = rest;
        } else {
          delete tags[trimmed];
        }
      }
    }
    await writeFile(
      METADATA_PATH,
      JSON.stringify({ tags }, null, 2),
      'utf-8'
    );
    return tags;
  },

  /**
   * После переименования тега в задачах — перенести метаданные со старого имени на новое
   */
  async migrateTagMetadata(oldTag: string, newTag: string): Promise<void> {
    const tags = await this.getMetadata();
    const meta = tags[oldTag];
    if (meta) {
      tags[newTag] = meta;
      delete tags[oldTag];
      await writeFile(
        METADATA_PATH,
        JSON.stringify({ tags }, null, 2),
        'utf-8'
      );
    }
  },
};
