import { z } from 'zod';
import { paginationQuerySchema, sortOrderSchema, paginationResponseSchema } from '../common.schema.js';

/**
 * Enum схемы для валидации
 * 
 * 21 статус согласно новой статусной модели:
 * - 10 DAPP статусов (Data Application Processing)
 * - 11 FC статусов (File Conversion)
 */
export const reportTaskStatusSchema = z.enum([
  // DAPP статусы
  'upload_generation',
  'registered',
  'failed',
  'upload_not_formed',
  'upload_formed',
  'accepted_dapp',
  'submitted_dapp',
  'killed_dapp',
  'new_dapp',
  'saving_dapp',
  // FC статусы
  'created',
  'deleted',
  'started',
  'start_failed',
  'converting',
  'completed',
  'convert_stopped',
  'in_queue',
  'file_success_not_exist',
  'failed_fc',
  'have_broken_files',
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
  createdBy: z.string().nullable(),
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
  canCancel: z.boolean(),
  canDelete: z.boolean(),
  canStart: z.boolean(),
  fileSize: z.number().nullable(),
  filesCount: z.number().int(),
  fileUrl: z.string().nullable(),
  errorMessage: z.string().nullable(),
  lastStatusChangedAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
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
 * Схема для query параметров списка заданий (расширенная фильтрация)
 */
export const tasksQuerySchema = paginationQuerySchema.extend({
  // Сортировка
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart', 'updatedAt']).default('createdAt'),
  sortOrder: sortOrderSchema,
  
  // Фильтры по статусам (множественный выбор через запятую)
  statuses: z.union([
    reportTaskStatusSchema,
    z.array(reportTaskStatusSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по филиалам (множественный выбор через запятую)
  branchIds: z.union([
    z.coerce.number().int().positive(),
    z.array(z.coerce.number().int().positive()),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по типам отчётов (множественный выбор через запятую)
  reportTypes: z.union([
    reportTypeSchema,
    z.array(reportTypeSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по форматам (множественный выбор через запятую)
  formats: z.union([
    fileFormatSchema,
    z.array(fileFormatSchema),
  ]).optional().transform(val => val ? (Array.isArray(val) ? val : [val]) : undefined),
  
  // Фильтры по периоду начала (periodStart)
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Фильтры по периоду окончания (periodEnd)
  periodEndFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  periodEndTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Фильтры по дате создания
  createdAtFrom: z.string().datetime().optional(),
  createdAtTo: z.string().datetime().optional(),
  
  // Фильтр по создателю
  createdBy: z.string().optional(),
  
  // Поисковая строка
  search: z.string().optional(),
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
 * Схема для ответа при массовом удалении (с детальными результатами)
 */
export const bulkDeleteResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.string().uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
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
 * Схема для ответа при массовой отмене (с детальными результатами)
 */
export const bulkCancelResponseSchema = z.object({
  cancelled: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.string().uuid(),
    success: z.boolean(),
    status: reportTaskStatusSchema.optional(),
    updatedAt: z.string().datetime().optional(),
    reason: z.string().optional(),
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

/**
 * Схема для запуска заданий (одного или нескольких)
 */
export const startTasksSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export type StartTasksInput = z.infer<typeof startTasksSchema>;

/**
 * Схема для успешного результата запуска задания
 */
export const startTaskResultSchema = z.object({
  taskId: z.string().uuid(),
  status: reportTaskStatusSchema,
  startedAt: z.string().datetime(),
});

export type StartTaskResult = z.infer<typeof startTaskResultSchema>;

/**
 * Схема для ошибки запуска задания
 */
export const startTaskErrorSchema = z.object({
  taskId: z.string().uuid(),
  reason: z.string(),
});

export type StartTaskError = z.infer<typeof startTaskErrorSchema>;

/**
 * Схема для ответа при запуске заданий
 */
export const startTasksResponseSchema = z.object({
  started: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(startTaskResultSchema),
  errors: z.array(startTaskErrorSchema),
});

export type StartTasksResponse = z.infer<typeof startTasksResponseSchema>;
