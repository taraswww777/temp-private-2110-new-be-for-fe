import { db } from '../../db';
import { report6406Tasks } from '../../db/schema';
import { ne, sql } from 'drizzle-orm';
import type { StorageVolumeItem } from '../../schemas/report-6406/storage.schema.ts';
import { StorageCodeEnum } from '../../schemas/report-6406/enums/StorageCodeEnum.ts';
import { env } from '../../config/env.ts';
import { TaskStatusEnum } from '../../schemas/report-6406/enums/TaskStatusEnum.ts';

const DEFAULT_STORAGE_CODE: StorageCodeEnum = StorageCodeEnum.LOCAL;

export class StorageService {
  /**
   * Получить информацию о объёме хранилищ (массив: по одному элементу на каждое хранилище).
   * Пока хранилище одно — возвращается массив из одного элемента.
   */
  async getStorageVolume(): Promise<StorageVolumeItem[]> {
    const totalSize = env.STORAGE_MAX_SIZE_BYTES || 1048576; // 1TB по умолчанию

    const [result] = await db
      .select({
        usedBytes: sql<number>`COALESCE(SUM(${report6406Tasks.fileSize}), 0)::bigint`,
      })
      .from(report6406Tasks)
      .where(ne(report6406Tasks.status, TaskStatusEnum.DELETE));

    const usedBytes = Number(result.usedBytes) || 0;
    const freeSize = totalSize - usedBytes;
    const usedPercent = totalSize > 0 ? (usedBytes / totalSize) * 100 : 0;
    const percent = Math.round(usedPercent * 100) / 100;


    const item: StorageVolumeItem = {
      code: DEFAULT_STORAGE_CODE,
      totalSize,
      freeSize,
      reservedSize: 0,
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
      .where(ne(report6406Tasks.status, TaskStatusEnum.DELETE));

    const usedBytes = Number(result.usedBytes) || 0;
    return Math.max(0, totalBytes - usedBytes);
  }
}

export const storageService = new StorageService();
