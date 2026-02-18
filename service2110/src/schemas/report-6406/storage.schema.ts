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
  id: z
    .string()
    .describe('ИД хранилища для key в JSX'),
  name: z
    .string()
    .describe('Имя хранилища (например, "Корзина 1", "ТФР")'),
  code: storageCodeSchema
    .describe('Код хранилища (TFR, S3, LOCAL)'),
  totalHuman: z
    .string()
    .describe('Общий объём хранилища в человекочитаемом формате (например, "1.00 TB")'),
  freeHuman: z
    .string()
    .describe('Свободный объём в человекочитаемом формате (например, "535.72 GB")'),
  percent: z
    .number()
    .min(0)
    .max(100)
    .describe('Процент заполнения (0–100)'),
});

export type StorageVolumeItem = z.infer<typeof storageVolumeItemSchema>;

/**
 * Схема ответа GET /storage/volume — массив хранилищ
 */
export const storageVolumeListResponseSchema = z.array(storageVolumeItemSchema);

export type StorageVolumeListResponse = z.infer<typeof storageVolumeListResponseSchema>;
