import { z } from 'zod';

/**
 * Enum кодов хранилищ
 */
export const storageCodeSchema = z.enum(['TFR', 'S3', 'LOCAL']);

export type StorageCode = z.infer<typeof storageCodeSchema>;

/**
 * Схема элемента массива хранилищ (корзина, ТФР и т.д.)
 */
export const storageVolumeItemSchema = z.object({
  code: storageCodeSchema.describe('Код хранилища (TFR, S3, LOCAL)'),
  totalSize: z.number().describe('Общий объём хранилища в Mb'),
  freeSize: z.number().describe('Свободный размер хранилища в Mb'),
  reservedSize: z.number().describe('Размер зарезервированного места в Mb'),
  percent: z.number().min(0).max(100).describe('Процент заполнения (0–100)'),
});

export type StorageVolumeItem = z.infer<typeof storageVolumeItemSchema>;

/**
 * Схема ответа GET /storage/volume — массив хранилищ
 */
export const storageVolumeListResponseSchema = z.array(storageVolumeItemSchema);

export type StorageVolumeListResponse = z.infer<typeof storageVolumeListResponseSchema>;
