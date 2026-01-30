import { z } from 'zod';
import { paginationQuerySchema, sortOrderSchema, paginationMetadataSchema } from '../common.schema.js';

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
  createdBy: z.string().nullable().describe('Пользователь, создавший задание'),
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
 * Схема для краткого задания в списке
 */
export const taskListItemSchema = z.object({
  id: z.string().uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.string().datetime().describe('Дата и время создания'),
  branchId: z.string().describe('Идентификатор филиала'),
  branchName: z.string().describe('Название филиала'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  status: reportTaskStatusSchema,
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах')
    .nullable(),
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  updatedAt: z.string().datetime().describe('Дата и время последнего обновления'),
});

export type TaskListItem = z.infer<typeof taskListItemSchema>;

/**
 * Схема для query параметров списка заданий (расширенная фильтрация)
 */
export const tasksQuerySchema = paginationQuerySchema.extend({
  // Сортировка
  sortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart', 'updatedAt']).default('createdAt').describe('Поле для сортировки'),
  sortOrder: sortOrderSchema,
  
  // Фильтры по статусам (массив)
  statuses: z.array(reportTaskStatusSchema).optional().describe('Список статусов для фильтрации'),
  
  // Фильтры по филиалам (массив строк)
  branchIds: z.array(z.coerce.string()).optional().describe('Список идентификаторов филиалов для фильтрации'),
  
  // Фильтры по типам отчётов (массив)
  reportTypes: z.array(reportTypeSchema).optional().describe('Список типов отчётов для фильтрации'),
  
  // Фильтры по форматам (массив)
  formats: z.array(fileFormatSchema).optional().describe('Список форматов для фильтрации'),
  
  // Фильтры по периоду начала (periodStart)
  periodStartFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Начальная дата периода для фильтрации'),
  periodStartTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Конечная дата периода для фильтрации'),
  
  // Фильтры по периоду окончания (periodEnd)
  periodEndFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Начальная дата окончания периода для фильтрации'),
  periodEndTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Конечная дата окончания периода для фильтрации'),
  
  // Фильтры по дате создания
  createdAtFrom: z.string().datetime().optional().describe('Начальная дата создания для фильтрации'),
  createdAtTo: z.string().datetime().optional().describe('Конечная дата создания для фильтрации'),
  
  // Фильтр по создателю
  createdBy: z.string().optional().describe('Фильтр по создателю'),
  
  // Поисковая строка
  search: z.string().optional().describe('Строка для поиска'),
});

export type TasksQuery = z.infer<typeof tasksQuerySchema>;

/**
 * Схема для ответа со списком заданий
 */
export const tasksListResponseSchema = z.object({
  tasks: z.array(taskListItemSchema),
  pagination: paginationMetadataSchema,
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
