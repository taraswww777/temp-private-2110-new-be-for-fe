import { z } from 'zod';
import { fileStatusZodSchema } from './enums/FileStatusEnum.ts';
import { taskFileSortBySchema } from './enums/TaskFileSortByEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationMetadataSchema } from '../common/pagination.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Файл задания (TaskFileDto по новому OAS).
 */
export const taskFileSchema = z.object({
  fileId: zIdSchema.describe('ИД файла'),
  linkResult: z.string().max(255).describe('Ссылка на файл'),
  size: z.number().int().min(0).describe('Размер файла'),
});

export type TaskFile = z.infer<typeof taskFileSchema>;

/**
 * Параметры пути для маршрута с taskId и fileId (например retry конвертации).
 */
export const taskFilePathParamsSchema = z.object({
  taskId: zIdSchema,
  fileId: zIdSchema,
});

export type TaskFileSortBy = z.infer<typeof taskFileSortBySchema>;

export { taskFileSortBySchema };


/**
 * Ответ POST /api/v1/report-6406/tasks/{id}/files (TaskFilesResponseDto).
 */
export const taskFilesResponseSchema = z.object({
  files: z.array(taskFileSchema).describe('Список файлов'),
  totalItems: z.number().int().min(0).describe('Общее количество файлов'),
  pagination: paginationMetadataSchema.describe('Метаданные пагинации'),
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
  registerReport6406OpenApiSchema(taskFilePathParamsSchema, 'TaskFilePathParamsDto');
  registerReport6406OpenApiSchema(taskFileSortBySchema, 'TaskFileSortByEnum');
  registerReport6406OpenApiSchema(taskFileSchema, 'TaskFileDto');
  registerReport6406OpenApiSchema(taskFilesResponseSchema, 'TaskFilesResponseDto');
  registerReport6406OpenApiSchema(taskFileUrlItemSchema, 'TaskFileUrlItemDto');
  registerReport6406OpenApiSchema(taskFileUrlResponseSchema, 'TaskFileUrlResponseDto');
  registerReport6406OpenApiSchema(retryFileConversionResponseSchema, 'RetryFileConversionResponseDto');
})();
