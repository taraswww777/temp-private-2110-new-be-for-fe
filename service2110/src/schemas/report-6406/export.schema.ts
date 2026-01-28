import { z } from 'zod';
import { sortOrderSchema } from '../common.schema.js';
import { reportTaskStatusSchema, reportTypeSchema } from './tasks.schema.js';

/**
 * Схема для фильтров экспорта
 */
export const exportFiltersSchema = z.object({
  status: z.union([
    reportTaskStatusSchema,
    z.array(reportTaskStatusSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  branchId: z.number().int().positive().optional(),
  reportType: z.union([
    reportTypeSchema,
    z.array(reportTypeSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).optional();

export type ExportFilters = z.infer<typeof exportFiltersSchema>;

/**
 * Схема для запроса экспорта
 */
export const exportTasksRequestSchema = z.object({
  filters: exportFiltersSchema,
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart']).default('createdAt'),
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
