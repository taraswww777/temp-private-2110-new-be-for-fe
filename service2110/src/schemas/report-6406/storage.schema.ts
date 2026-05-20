import { z } from 'zod';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Информация о хранилище (StorageResponse по новому OAS).
 */
export const storageResponseSchema = z.object({
  code: z.string().max(255).describe('Код хранилища'),
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

/**
 * Параметры пути GET /storages/s3/{bucket}/list.
 */
export const s3BucketPathParamSchema = z.object({
  bucket: z.string().max(255).describe('Имя bucket в S3'),
});

/**
 * Ответ GET /storages/s3/{bucket}/list — список имён файлов.
 */
export const s3BucketListResponseSchema = z.array(z.string().max(255));

export type S3BucketListResponse = z.infer<typeof s3BucketListResponseSchema>;

(function registerStorageReport6406OpenApi() {
  registerReport6406OpenApiSchema(storageResponseSchema, 'StorageResponse');
  registerReport6406OpenApiSchema(storageVolumeListResponseSchema, 'StorageVolumeListResponseDto');
  registerReport6406OpenApiSchema(s3BucketPathParamSchema, 'S3BucketPathParamDto');
  registerReport6406OpenApiSchema(s3BucketListResponseSchema, 'S3BucketListResponseDto');
})();
