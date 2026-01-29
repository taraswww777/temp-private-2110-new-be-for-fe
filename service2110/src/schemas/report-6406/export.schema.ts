import { z } from 'zod';
import { sortOrderSchema } from '../common.schema.js';
import { reportTaskStatusSchema, reportTypeSchema, fileFormatSchema } from './tasks.schema.js';

/**
 * Схема для фильтров экспорта (расширенная)
 */
export const exportFiltersSchema = z.object({
  // Фильтры по статусам
  statuses: z.union([
    reportTaskStatusSchema,
    z.array(reportTaskStatusSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по филиалам
  branchIds: z.union([
    z.number().int().positive(),
    z.array(z.number().int().positive()),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по типам отчётов
  reportTypes: z.union([
    reportTypeSchema,
    z.array(reportTypeSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по форматам
  formats: z.union([
    fileFormatSchema,
    z.array(fileFormatSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по периоду (periodStart)
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Фильтры по периоду (periodEnd)
  periodEndFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEndTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Фильтры по дате создания
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
}).optional();

export type ExportFilters = z.infer<typeof exportFiltersSchema>;

/**
 * Схема для запроса экспорта (с дополнительными опциями)
 */
export const exportTasksRequestSchema = z.object({
  filters: exportFiltersSchema,
  columns: z.array(z.string()).optional().describe('Список колонок для включения в экспорт'),
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart', 'updatedAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
});

export type ExportTasksRequest = z.infer<typeof exportTasksRequestSchema>;

/**
 * Схема для ответа экспорта
 */
export const exportTasksResponseSchema = z.object({
  exportId: z.string().uuid(),
  status: z.literal('COMPLETED'),
  fileUrl: z.string(),
  fileSize: z.number().int(),
  downloadUrlExpiresAt: z.string().datetime(),
  recordsCount: z.number().int(),
  createdAt: z.string().datetime(),
});

export type ExportTasksResponse = z.infer<typeof exportTasksResponseSchema>;
