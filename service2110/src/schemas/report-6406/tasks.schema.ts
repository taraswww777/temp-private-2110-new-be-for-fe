import { z } from 'zod';
import {
  paginationQuerySchema,
  sortOrderSchema,
  paginationMetadataSchema,
  sortingRequestSchema,
  filterSchema,
} from '../common.schema.js';

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
  branchId: z.string().describe('Идентификатор филиала'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода (формат: YYYY-MM-DD)'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода (формат: YYYY-MM-DD)'),
  accountMask: z.string().max(20).optional().describe('Маска счетов для фильтрации'),
  accountMaskSecondOrder: z.string().max(2).optional().describe('Маска счетов второго порядка'),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().max(20).optional().describe('Источник данных'),
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
  id: z.string().uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.string().datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании)'),
  branchId: z.string().describe('Идентификатор филиала'),
  branchName: z.string().describe('Название филиала'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  accountMask: z.string().nullable().describe('Маска счетов для фильтрации'),
  accountMaskSecondOrder: z.string().nullable().describe('Маска счетов второго порядка'),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().nullable().describe('Источник данных'),
  status: reportTaskStatusSchema,
  canCancel: z.boolean().describe('Возможность отмены задания'),
  canDelete: z.boolean().describe('Возможность удаления задания'),
  canStart: z.boolean().describe('Возможность запуска задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах (например, 10485760 = 10 MB). NULL если размер неизвестен.')
    .nullable(),
  filesCount: z
    .number()
    .int()
    .min(0)
    .describe('Количество файлов в задании'),
  fileUrl: z.string().nullable().describe('URL для скачивания файла'),
  errorMessage: z.string().nullable().describe('Сообщение об ошибке'),
  lastStatusChangedAt: z.string().datetime().describe('Дата и время последнего изменения статуса'),
  startedAt: z.string().datetime().nullable().describe('Дата и время начала обработки'),
  completedAt: z.string().datetime().nullable().describe('Дата и время завершения'),
  updatedAt: z.string().datetime().describe('Дата и время последнего обновления'),
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
 * Схема для элемента списка заданий (TaskListItemDto)
 */
export const taskListItemSchema = z.object({
  id: z.string().uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.string().datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при возврате)'),
  branchId: z.string().describe('Идентификатор филиала'),
  branchName: z.string().describe('Название филиала'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  status: reportTaskStatusSchema.describe('Статус задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах')
    .nullable(),
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  updatedAt: z.string().datetime().describe('Дата и время последнего обновления'),
  canCancel: z.boolean().describe('Можно ли отменить задание'),
  canDelete: z.boolean().describe('Можно ли удалить задание'),
  canStart: z.boolean().describe('Можно ли запустить задание'),
});

export type TaskListItem = z.infer<typeof taskListItemSchema>;

/**
 * Схема тела запроса GET /api/v1/report-6406/tasks/ (пагинация, сортировка, фильтрация)
 */
export const getTasksRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: sortingRequestSchema.describe('Параметры сортировки'),
  filter: z.array(filterSchema).optional().describe('Фильтры для списка заданий'),
});

export type GetTasksRequest = z.infer<typeof getTasksRequestSchema>;

/**
 * Схема для ответа GET /api/v1/report-6406/tasks/ (пагинированный список)
 */
export const tasksListResponseSchema = z.object({
  items: z.array(taskListItemSchema).describe('Список заданий'),
  totalItems: z.number().int().min(0).describe('Общее количество заданий'),
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
