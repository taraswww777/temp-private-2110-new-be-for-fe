import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { env } from '../config/env.js';

const TASKS_DIR = resolve(process.cwd(), env.TASKS_DIR);
const BLACKLIST_PATH = join(TASKS_DIR, 'youtrack-tags-blacklist.json');

const DEFAULT_CONTENT = { blacklist: [] as string[] };

/**
 * Сервис для работы с чёрным списком тегов.
 * Теги из чёрного списка не отправляются в YouTrack при создании задачи.
 */
export const tagsBlacklistService = {
  async getPath(): Promise<string> {
    return BLACKLIST_PATH;
  },

  /**
   * Загрузить чёрный список из файла. Если файла нет — вернуть пустой массив.
   */
  async getBlacklist(): Promise<string[]> {
    if (!existsSync(BLACKLIST_PATH)) {
      return [];
    }
    const content = await readFile(BLACKLIST_PATH, 'utf-8');
    const data = JSON.parse(content) as { blacklist?: unknown };
    if (!Array.isArray(data.blacklist)) {
      return [];
    }
    return data.blacklist.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
  },

  /**
   * Полная замена чёрного списка (POST).
   */
  async setBlacklist(blacklist: string[]): Promise<string[]> {
    const normalized = blacklist
      .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      .map((t) => t.trim());
    const unique = [...new Set(normalized)];
    await writeFile(
      BLACKLIST_PATH,
      JSON.stringify({ blacklist: unique }, null, 2),
      'utf-8'
    );
    return unique;
  },

  /**
   * Добавить тег в чёрный список (PUT). Если уже есть — без изменений.
   */
  async addTag(tag: string): Promise<string[]> {
    const current = await this.getBlacklist();
    const trimmed = tag.trim();
    if (!trimmed || current.includes(trimmed)) {
      return current;
    }
    const next = [...current, trimmed].sort();
    await writeFile(
      BLACKLIST_PATH,
      JSON.stringify({ blacklist: next }, null, 2),
      'utf-8'
    );
    return next;
  },

  /**
   * Удалить тег из чёрного списка (DELETE).
   */
  async removeTag(tag: string): Promise<string[]> {
    const current = await this.getBlacklist();
    const trimmed = tag.trim();
    const next = current.filter((t) => t !== trimmed);
    if (next.length === current.length) {
      return current;
    }
    await writeFile(
      BLACKLIST_PATH,
      JSON.stringify({ blacklist: next }, null, 2),
      'utf-8'
    );
    return next;
  },

  /**
   * Отфильтровать теги задачи: исключить те, что в чёрном списке.
   */
  async filterTagsForYouTrack(tags: string[] | undefined): Promise<string[]> {
    if (!tags || tags.length === 0) return [];
    const blacklist = await this.getBlacklist();
    const set = new Set(blacklist.map((t) => t.toLowerCase()));
    return tags.filter((t) => t.trim().length > 0 && !set.has(t.trim().toLowerCase()));
  },
};
