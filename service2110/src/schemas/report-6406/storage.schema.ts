import { z } from 'zod';

/**
 * Схема для ответа о состоянии хранилища
 */
export const storageVolumeResponseSchema = z.object({
  totalBytes: z.number().int(),
  usedBytes: z.number().int(),
  freeBytes: z.number().int(),
  usedPercent: z.number(),
  totalHuman: z.string(),
  usedHuman: z.string(),
  freeHuman: z.string(),
  warning: z.string().nullable(),
});

export type StorageVolumeResponse = z.infer<typeof storageVolumeResponseSchema>;
