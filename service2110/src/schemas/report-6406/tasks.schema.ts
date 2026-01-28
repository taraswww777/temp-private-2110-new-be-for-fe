import { z } from 'zod';
import { paginationQuerySchema, sortOrderSchema, paginationResponseSchema } from '../common.schema';

/**
 * Enum схемы для валидации
 */
export const reportTaskStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const currencySchema = z.enum(['RUB', 'FOREIGN']);

export const fileFormatSchema = z.enum(['TXT', 'XLSX', 'XML']);

export const reportTypeSchema = z.enum(['LSOZ', 'LSOS', 'LSOP']);

export type ReportTaskStatusType = z.infer<typeof reportTaskStatusSchema>;
export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;
export type ReportTypeType = z.infer<typeof reportTypeSchema>;

/**
 * Схема для создания задания
 */
export const createTaskSchema = z.object({
  branchId: z.number().int().positive(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountMask: z.string().max(20).optional(),
  accountMaskSecondOrder: z.string().max(2).optional(),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().max(20).optional(),
}).refine(
  (data) => {
    const start = new Date(data.periodStart);
    const end = new Date(data.periodEnd);
    return end >= start;
  },
  {
    message: 'periodEnd must be greater than or equal to periodStart',
    path: ['periodEnd'],
  }
);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Схема для ответа с информацией о пакете в задании
 */
export const taskPackageInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  addedAt: z.string().datetime(),
});

export type TaskPackageInfo = z.infer<typeof taskPackageInfoSchema>;

/**
 * Схема для полного задания
 */
export const taskSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  branchId: z.number().int(),
  branchName: z.string(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountMask: z.string().nullable(),
  accountMaskSecondOrder: z.string().nullable(),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().nullable(),
  status: reportTaskStatusSchema,
  fileSize: z.number().nullable(),
  fileUrl: z.string().nullable(),
  errorMessage: z.string().nullable(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof taskSchema>;

/**
 * Схема для детального задания (с пакетами)
 */
export const taskDetailSchema = taskSchema.extend({
  packages: z.array(taskPackageInfoSchema),
});

export type TaskDetail = z.infer<typeof taskDetailSchema>;

/**
 * Схема для краткого задания в списке
 */
export const taskListItemSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  branchId: z.number().int(),
  branchName: z.string(),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: reportTaskStatusSchema,
  fileSize: z.number().nullable(),
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  updatedAt: z.string().datetime(),
});

export type TaskListItem = z.infer<typeof taskListItemSchema>;

/**
 * Схема для query параметров списка заданий
 */
export const tasksQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart']).default('createdAt'),
  sortOrder: sortOrderSchema,
  status: z.union([
    reportTaskStatusSchema,
    z.array(reportTaskStatusSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  branchId: z.coerce.number().int().positive().optional(),
  reportType: z.union([
    reportTypeSchema,
    z.array(reportTypeSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type TasksQuery = z.infer<typeof tasksQuerySchema>;

/**
 * Схема для ответа со списком заданий
 */
export const tasksListResponseSchema = z.object({
  tasks: z.array(taskListItemSchema),
  pagination: paginationResponseSchema,
});

export type TasksListResponse = z.infer<typeof tasksListResponseSchema>;

/**
 * Схема для массового удаления заданий
 */
export const bulkDeleteTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;

/**
 * Схема для ответа при массовом удалении
 */
export const bulkDeleteResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  errors: z.array(z.object({
    taskId: z.string().uuid(),
    reason: z.string(),
  })),
});

export type BulkDeleteResponse = z.infer<typeof bulkDeleteResponseSchema>;

/**
 * Схема для массовой отмены заданий
 */
export const bulkCancelTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export type BulkCancelTasksInput = z.infer<typeof bulkCancelTasksSchema>;

/**
 * Схема для ответа при массовой отмене
 */
export const bulkCancelResponseSchema = z.object({
  cancelled: z.number().int().min(0),
  failed: z.number().int().min(0),
  errors: z.array(z.object({
    taskId: z.string().uuid(),
    reason: z.string(),
  })),
});

export type BulkCancelResponse = z.infer<typeof bulkCancelResponseSchema>;

/**
 * Схема для ответа при отмене задания
 */
export const cancelTaskResponseSchema = z.object({
  id: z.string().uuid(),
  status: reportTaskStatusSchema,
  updatedAt: z.string().datetime(),
});

export type CancelTaskResponse = z.infer<typeof cancelTaskResponseSchema>;
