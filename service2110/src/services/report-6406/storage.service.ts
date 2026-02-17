import { db } from '../../db/index.ts';
import { report6406Tasks } from '../../db/schema/index.ts';
import { sql, ne } from 'drizzle-orm';
import type { StorageVolumeItem } from '../../schemas/report-6406/storage.schema.ts';
import { StorageCode } from '../../schemas/report-6406/storage.schema.ts';
import { formatBytesFixed } from '../../utils/file-size-formatter.ts';
import { env } from '../../config/env.ts';
import { TaskStatus } from '../../types/status-model.ts';

const DEFAULT_STORAGE_ID = 'default';
const DEFAULT_STORAGE_NAME = 'Корзина 1';
const DEFAULT_STORAGE_CODE: StorageCode = 'LOCAL';

export class StorageService {
  /**
   * Получить информацию о объёме хранилищ (массив: по одному элементу на каждое хранилище).
   * Пока хранилище одно — возвращается массив из одного элемента.
   */
  async getStorageVolume(): Promise<StorageVolumeItem[]> {
    const totalBytes = env.STORAGE_MAX_SIZE_BYTES || 1099511627776; // 1TB по умолчанию

    const [result] = await db
      .select({
        usedBytes: sql<number>`COALESCE(SUM(${report6406Tasks.fileSize}), 0)::bigint`,
      })
      .from(report6406Tasks)
      .where(ne(report6406Tasks.status, TaskStatus.DELETED));

    const usedBytes = Number(result.usedBytes) || 0;
    const freeBytes = totalBytes - usedBytes;
    const usedPercent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
    const percent = Math.round(usedPercent * 100) / 100;

    const totalHuman = formatBytesFixed(totalBytes);
    const freeHuman = formatBytesFixed(freeBytes);

    const item: StorageVolumeItem = {
      id: DEFAULT_STORAGE_ID,
      name: DEFAULT_STORAGE_NAME,
      code: DEFAULT_STORAGE_CODE,
      totalHuman,
      freeHuman,
      percent,
    };

    return [item];
  }

  /**
   * Получить свободный объём в байтах для первого (по умолчанию) хранилища.
   * Используется внутренне для проверки «достаточно ли места» при запуске заданий.
   */
  async getStorageFreeBytes(): Promise<number> {
    const totalBytes = env.STORAGE_MAX_SIZE_BYTES || 1099511627776;

    const [result] = await db
      .select({
        usedBytes: sql<number>`COALESCE(SUM(${report6406Tasks.fileSize}), 0)::bigint`,
      })
      .from(report6406Tasks)
      .where(ne(report6406Tasks.status, TaskStatus.DELETED));

    const usedBytes = Number(result.usedBytes) || 0;
    return Math.max(0, totalBytes - usedBytes);
  }
}

export const storageService = new StorageService();
