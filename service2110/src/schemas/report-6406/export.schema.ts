import { z } from 'zod';
import { taskStatusSchema } from './enums/TaskStatusEnum.ts';

import { zIdSchema } from '../common/id.schema.ts';

/**
 * Схема для ответа экспорта
 */
export const exportTasksResponseSchema = z.object({
  exportId:zIdSchema.describe('ИД экспорта'),
  status: taskStatusSchema.describe('Статус экспорта'),
  fileUrl: z.string().describe('URL для скачивания файла'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер экспортированного файла в байтах (например, 52428800 = 50 MB)'),
  downloadUrlExpiresAt: z.iso.datetime().describe('Дата истечения срока действия ссылки'),
  recordsCount: z
    .number()
    .int()
    .min(0)
    .describe('Количество записей в экспортированном файле'),
  createdAt: z.iso.datetime().describe('Дата создания экспорта'),
});

export type ExportTasksResponse = z.infer<typeof exportTasksResponseSchema>;
