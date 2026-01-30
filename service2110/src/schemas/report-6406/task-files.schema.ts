import { z } from 'zod';
import { paginationQuerySchema, paginationMetadataSchema, sortOrderSchema } from '../common.schema.js';

/**
 * Enum для статусов файлов
 */
export const fileStatusSchema = z.enum(['PENDING', 'CONVERTING', 'COMPLETED', 'FAILED']);

export type FileStatusType = z.infer<typeof fileStatusSchema>;

/**
 * Схема для файла задания
 */
export const taskFileSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах (например, 10485760 = 10 MB)'),
  fileType: z.string(),
  status: fileStatusSchema,
  downloadUrl: z.string().nullable(),
  downloadUrlExpiresAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskFile = z.infer<typeof taskFileSchema>;

/**
 * Схема для query параметров списка файлов
 */
export const taskFilesQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['status', 'fileName', 'fileSize', 'createdAt']).default('status'),
  sortOrder: sortOrderSchema,
  status: z.array(fileStatusSchema).optional(),
});

export type TaskFilesQuery = z.infer<typeof taskFilesQuerySchema>;

/**
 * Схема для ответа со списком файлов
 */
export const taskFilesResponseSchema = z.object({
  taskId: z.string().uuid(),
  files: z.array(taskFileSchema),
  pagination: paginationMetadataSchema,
});

export type TaskFilesResponse = z.infer<typeof taskFilesResponseSchema>;

/**
 * Схема для ответа при повторе конвертации файла
 */
export const retryFileConversionResponseSchema = z.object({
  id: z.string().uuid(),
  status: fileStatusSchema,
  message: z.string(),
});

export type RetryFileConversionResponse = z.infer<typeof retryFileConversionResponseSchema>;
