import { z } from 'zod';
import { paginationQuerySchema, paginationMetadataSchema } from '../common.schema.ts';
import { SortOrderEnum, sortOrderSchema } from '../enums/SortOrderEnum';

/**
 * Enum для статусов файлов
 */
export const fileStatusSchema = z.enum(['PENDING', 'CONVERTING', 'COMPLETED', 'FAILED']);

export type FileStatusType = z.infer<typeof fileStatusSchema>;

/**
 * Схема для файла задания
 */
export const taskFileSchema = z.object({
  id: z.uuid(),
  fileName: z.string(),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах (например, 10485760 = 10 MB)'),
  fileType: z.string(),
  status: fileStatusSchema,
  downloadUrl: z.string().nullable(),
  downloadUrlExpiresAt: z.iso.datetime().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TaskFile = z.infer<typeof taskFileSchema>;

/**
 * Схема для query параметров списка файлов
 */
export const taskFilesQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['status', 'fileName', 'fileSize', 'createdAt']).default('status'),
  sortOrder: sortOrderSchema.default(SortOrderEnum.DESC),
  status: z.array(fileStatusSchema).optional(),
});

export type TaskFilesQuery = z.infer<typeof taskFilesQuerySchema>;

/**
 * Схема для ответа со списком файлов
 */
export const taskFilesResponseSchema = z.object({
  taskId: z.uuid(),
  files: z.array(taskFileSchema),
  pagination: paginationMetadataSchema,
});

export type TaskFilesResponse = z.infer<typeof taskFilesResponseSchema>;

/**
 * Схема для ответа при повторе конвертации файла
 */
export const retryFileConversionResponseSchema = z.object({
  id: z.uuid(),
  status: fileStatusSchema,
  message: z.string(),
});

export type RetryFileConversionResponse = z.infer<typeof retryFileConversionResponseSchema>;
