import { z } from 'zod';
import { reportTaskStatusSchema, fileFormatSchema } from './tasks.schema.js';
import { SortOrderEnum, sortOrderSchema } from '../enums/SortOrderEnum';
import { reportTypeSchema } from '../enums/ReportTypeEnum';

/**
 * Схема для фильтров экспорта (расширенная)
 */
export const exportFiltersSchema = z.object({
  // Фильтры по статусам (массив)
  statuses: z.array(reportTaskStatusSchema).optional().describe('Список статусов для фильтрации'),

  // Фильтры по филиалам (массив строк)
  branchIds: z.array(z.uuid()).optional().describe('Список идентификаторов филиалов для фильтрации'),

  // Фильтры по типам отчётов (массив)
  reportTypes: z.array(reportTypeSchema).optional().describe('Список типов отчётов для фильтрации'),

  // Фильтры по форматам (массив)
  formats: z.array(fileFormatSchema).optional().describe('Список форматов для фильтрации'),

  // Фильтры по периоду (periodStart)
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Начальная дата периода'),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Конечная дата периода'),

  // Фильтры по периоду (periodEnd)
  periodEndFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Начальная дата окончания периода'),
  periodEndTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Конечная дата окончания периода'),

  // Фильтры по дате создания
  createdAtFrom: z.iso.datetime().optional().describe('Начальная дата создания'),
  createdAtTo: z.iso.datetime().optional().describe('Конечная дата создания'),
}).optional();

export type ExportFilters = z.infer<typeof exportFiltersSchema>;

/**
 * Схема для запроса экспорта (с дополнительными опциями)
 */
export const exportTasksRequestSchema = z.object({
  filters: exportFiltersSchema,
  columns: z.array(z.string()).optional().describe('Список колонок для включения в экспорт'),
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart', 'updatedAt']).default('createdAt').describe('Поле для сортировки'),
  sortOrder: sortOrderSchema.default(SortOrderEnum.DESC),
});

export type ExportTasksRequest = z.infer<typeof exportTasksRequestSchema>;

/**
 * Схема для ответа экспорта
 */
export const exportTasksResponseSchema = z.object({
  exportId: z.uuid().describe('Идентификатор экспорта'),
  status: z.literal('COMPLETED').describe('Статус экспорта'),
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
