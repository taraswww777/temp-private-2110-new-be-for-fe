import { z } from 'zod';

/**
 * Схема для ответа о состоянии хранилища
 */
export const storageVolumeResponseSchema = z.object({
  totalBytes: z
    .number()
    .int()
    .min(0)
    .describe('Общий объём хранилища в байтах (например, 1099511627776 = 1 TB)'),
  usedBytes: z
    .number()
    .int()
    .min(0)
    .describe('Использовано байт в хранилище (например, 524288000000 = 488.28 GB)'),
  freeBytes: z
    .number()
    .int()
    .min(0)
    .describe('Свободно байт в хранилище (например, 575223627776 = 535.72 GB)'),
  usedPercent: z
    .number()
    .min(0)
    .max(100)
    .describe('Процент использования хранилища'),
  totalHuman: z
    .string()
    .describe('Общий объём хранилища в человекочитаемом формате (например, "1.00 TB")'),
  usedHuman: z
    .string()
    .describe('Использовано в человекочитаемом формате (например, "488.28 GB")'),
  freeHuman: z
    .string()
    .describe('Свободно в человекочитаемом формате (например, "535.72 GB")'),
  warning: z
    .string()
    .describe('Предупреждение о заполнении хранилища (если применимо)')
    .nullable(),
});

export type StorageVolumeResponse = z.infer<typeof storageVolumeResponseSchema>;
