import { db } from '../../db/index.js';
import { report6406Tasks } from '../../db/schema/index.js';
import { sql, ne } from 'drizzle-orm';
import type { StorageVolumeResponse } from '../../schemas/report-6406/storage.schema.js';
import { formatBytesFixed } from '../../utils/file-size-formatter.js';
import { env } from '../../config/env.js';
import { TaskStatus } from '../../types/status-model.js';

export class StorageService {
  /**
   * Получить информацию о объёме хранилища
   */
  async getStorageVolume(): Promise<StorageVolumeResponse> {
    const totalBytes = env.STORAGE_MAX_SIZE_BYTES || 1099511627776; // 1TB по умолчанию
    const warningThreshold = env.STORAGE_WARNING_THRESHOLD || 85; // 85% по умолчанию

    // Подсчитываем используемый объём: сумма fileSize всех заданий кроме удалённых
    const [result] = await db
      .select({
        usedBytes: sql<number>`COALESCE(SUM(${report6406Tasks.fileSize}), 0)::bigint`,
      })
      .from(report6406Tasks)
      .where(ne(report6406Tasks.status, TaskStatus.DELETED));

    const usedBytes = Number(result.usedBytes) || 0;
    const freeBytes = totalBytes - usedBytes;
    const usedPercent = (usedBytes / totalBytes) * 100;

    // Форматирование в человекочитаемый вид
    const totalHuman = formatBytesFixed(totalBytes);
    const usedHuman = formatBytesFixed(usedBytes);
    const freeHuman = formatBytesFixed(freeBytes);

    // Предупреждение если использовано больше порогового значения
    let warning: string | null = null;
    if (usedPercent >= warningThreshold) {
      warning = `Storage usage is above ${warningThreshold}%. Consider cleaning up old reports.`;
    }

    return {
      totalBytes,
      usedBytes,
      freeBytes,
      usedPercent: Math.round(usedPercent * 100) / 100, // Округляем до 2 знаков после запятой
      totalHuman,
      usedHuman,
      freeHuman,
      warning,
    };
  }
}

export const storageService = new StorageService();
