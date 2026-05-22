import { z } from 'zod';

import { storageCodeZodSchema } from './enums/StorageCodeEnum.ts';
import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Информация о хранилище (StorageResponse по новому OAS).
 */
export const storageResponseSchema = z.object({
  code: storageCodeZodSchema,
  totalSize: z.number().int().min(0).describe('Общий объём хранилища в Mb'),
  freeSize: z.number().int().min(0).describe('Свободный размер хранилища в Mb'),
  percent: z.number().min(0).describe('Процент заполнения (0–100)'),
});

export type StorageResponse = z.infer<typeof storageResponseSchema>;

/**
 * Ответ GET /storages/volume — массив хранилищ.
 */
export const storageVolumeListResponseSchema = z.array(storageResponseSchema);

export type StorageVolumeListResponse = z.infer<typeof storageVolumeListResponseSchema>;

/** @deprecated используйте storageResponseSchema */
export const storageVolumeItemSchema = storageResponseSchema;

export type StorageVolumeItem = z.infer<typeof storageVolumeItemSchema>;

(function registerStorageReport6406OpenApi() {
  registerReport6406OpenApiSchema(storageResponseSchema, 'StorageResponse');
  registerReport6406OpenApiSchema(storageVolumeListResponseSchema, 'StorageVolumeListResponseDto');
})();
