import { z } from 'zod';
import { SortOrderEnum, sortOrderSchema } from '../common/SortOrderEnum.ts';
import { fileStatusZodSchema } from './enums/FileStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationMetadataSchema, paginationQuerySchema } from '../common/pagination.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';


/**
 * Схема для файла задания
 */
export const taskFileSchema = z.object({
  id: zIdSchema,
  fileName: z.string(),
  fileSize: z.number().int().min(0).describe('Размер файла в байтах (например, 10485760 = 10 MB)'),
});

export type TaskFile = z.infer<typeof taskFileSchema>;

/**
 * Допустимые колонки для сортировки файлов задания
 */
export const taskFileSortBySchema = z.enum(['status', 'fileName', 'fileSize', 'createdAt']);
export type TaskFileSortBy = z.infer<typeof taskFileSortBySchema>;

/**
 * Схема для query параметров списка файлов
 */
export const taskFilesQuerySchema = paginationQuerySchema.extend({
  sortBy: taskFileSortBySchema.default('status'),
  sortOrder: sortOrderSchema.default(SortOrderEnum.DESC),
  status: z.array(fileStatusZodSchema).optional(),
});

export type TaskFilesQuery = z.infer<typeof taskFilesQuerySchema>;

/**
 * Схема для ответа со списком файлов
 */
export const taskFilesResponseSchema = z.object({
  taskId: zIdSchema,
  files: z.array(taskFileSchema),
  pagination: paginationMetadataSchema,
});

export type TaskFilesResponse = z.infer<typeof taskFilesResponseSchema>;

/**
 * Схема для ответа при повторе конвертации файла
 */
export const retryFileConversionResponseSchema = z.object({
  id: zIdSchema,
  status: fileStatusZodSchema,
  message: z.string(),
});

export type RetryFileConversionResponse = z.infer<typeof retryFileConversionResponseSchema>;


/**
 * Схема для ответа со списком ссылок для файлов
 */
export const taskFileUrlItemSchema = z.object({
  url: z.string(),
  fileName: z.string(),
});

export const taskFileUrlResponseSchema = z.array(taskFileUrlItemSchema);

(function registerTaskFilesReport6406OpenApi() {
  registerReport6406OpenApiSchema(taskFileSortBySchema, 'TaskFileSortByEnum');
  registerReport6406OpenApiSchema(taskFilesQuerySchema, 'TaskFilesQueryDto');
  registerReport6406OpenApiSchema(taskFileSchema, 'TaskFileDto');
  registerReport6406OpenApiSchema(taskFilesResponseSchema, 'TaskFilesResponseDto');
  registerReport6406OpenApiSchema(taskFileUrlItemSchema, 'TaskFileUrlItemDto');
  registerReport6406OpenApiSchema(taskFileUrlResponseSchema, 'TaskFileUrlResponseDto');
  registerReport6406OpenApiSchema(retryFileConversionResponseSchema, 'RetryFileConversionResponseDto');
})();

