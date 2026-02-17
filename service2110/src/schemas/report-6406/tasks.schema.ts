import { z } from 'zod';
import { paginationQuerySchema, } from '../common.schema.js';
import { reportTypeSchema } from '../enums/ReportTypeEnum';

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


export type ReportTaskStatusType = z.infer<typeof reportTaskStatusSchema>;
export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;

/**
 * Схема для создания задания
 * Поддерживает как branchId (для обратной совместимости), так и branchIds (новый формат)
 */
export const createTaskSchema = z.object({
  branchId: z.uuid().optional().describe('Идентификатор филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(z.uuid()).min(1).optional().describe('Массив идентификаторов филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода (формат: YYYY-MM-DD)'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода (формат: YYYY-MM-DD)'),
  accountMask: z.string().max(20).optional().describe('Маска счетов для фильтрации'),
  accountSecondOrder: z.string().max(2).optional().describe('Счета второго порядка'),
  currency: currencySchema.optional().describe('Валюта (опционально при создании; по умолчанию RUB)'),
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().max(20).optional().describe('Ссылка на справочник или идентификатор источника данных'),
}).refine(
  (data) => {
    // Должен быть указан либо branchId, либо branchIds
    if (!data.branchId && !data.branchIds) {
      return false;
    }
    return true;
  },
  {
    message: 'Either branchId or branchIds must be provided',
    path: ['branchId'],
  }
).refine(
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
  id: z.uuid(),
  name: z.string(),
  addedAt: z.iso.datetime(),
});

export type TaskPackageInfo = z.infer<typeof taskPackageInfoSchema>;

/**
 * Схема для полного задания
 */
export const taskSchema = z.object({
  id: z.uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании)'),
  branchId: z.uuid().describe('Идентификатор филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(z.uuid()).describe('Массив идентификаторов филиалов'),
  branchName: z.string().describe('Название филиала (название первого филиала)'),
  branchNames: z.array(z.string()).describe('Массив названий филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  accountMask: z.string().nullable().describe('Маска счетов для фильтрации'),
  accountSecondOrder: z.string().nullable().describe('Счета второго порядка'),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema.optional().describe('Тип отчёта'),
  source: z.string().nullable().describe('Ссылка на справочник или идентификатор источника данных'),
  status: reportTaskStatusSchema,
  canCancel: z.boolean().describe('Возможность отмены задания'),
  canDelete: z.boolean().describe('Возможность удаления задания'),
  canStart: z.boolean().describe('Возможность запуска задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах. null — размер ещё не рассчитан (задание не завершено).')
    .nullable(),
  filesCount: z
    .number()
    .int()
    .min(0)
    .describe('Количество файлов в задании'),
  fileUrl: z.string().nullable().describe('URL для скачивания файла'),
  errorMessage: z.string().nullable().describe('Сообщение об ошибке'),
  lastStatusChangedAt: z.iso.datetime().describe('Дата и время последнего изменения статуса'),
  startedAt: z.iso.datetime().nullable().describe('Дата и время начала обработки'),
  completedAt: z.iso.datetime().nullable().describe('Дата и время завершения'),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
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
 * Единая схема для детальной информации о задании (POST 201 и GET /{id} 200).
 * Без лишних полей errorMessage, fileUrl. С полями s3FolderId, type, accounts для UI.
 */
export const taskDetailsSchema = z.object({
  id: z.uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании)'),
  branchId: z.uuid().describe('Идентификатор филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(z.uuid()).describe('Массив идентификаторов филиалов'),
  branchName: z.string().describe('Название филиала (название первого филиала)'),
  branchNames: z.array(z.string()).describe('Массив названий филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  accountMask: z.string().nullable().describe('Маска счетов для фильтрации'),
  accountSecondOrder: z.string().nullable().describe('Счета второго порядка'),
  currency: currencySchema.describe('Валюта (например: RUB, FOREIGN)'),
  format: fileFormatSchema,
  reportType: reportTypeSchema.optional().describe('Тип отчёта'),
  source: z.string().nullable().describe('Ссылка на справочник или идентификатор источника данных'),
  status: reportTaskStatusSchema.describe('Статус задания'),
  canCancel: z.boolean().describe('Возможность отмены задания'),
  canDelete: z.boolean().describe('Возможность удаления задания'),
  canStart: z.boolean().describe('Возможность запуска задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах. null — размер ещё не рассчитан.')
    .nullable(),
  filesCount: z
    .number()
    .int()
    .min(0)
    .describe('Количество файлов в задании'),
  lastStatusChangedAt: z.iso.datetime().describe('Дата и время последнего изменения статуса'),
  startedAt: z.iso.datetime().nullable().describe('Дата и время начала обработки'),
  completedAt: z.iso.datetime().nullable().describe('Дата и время завершения'),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
  s3FolderId: z.string().nullable().describe('ID папки в S3'),
  type: z.string().nullable().describe('Тип задания'),
  accounts: z.array(z.string()).describe('Список счетов'),
  packages: z.array(taskPackageInfoSchema).describe('Пакеты, в которые входит задание'),
});

export type TaskDetails = z.infer<typeof taskDetailsSchema>;

/**
 * Схема для элемента списка заданий (TaskListItemDto)
 */
export const taskListItemSchema = z.object({
  id: z.uuid().describe('Уникальный идентификатор задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при возврате)'),
  branchId: z.uuid().describe('Идентификатор филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(z.uuid()).describe('Массив идентификаторов филиалов'),
  branchName: z.string().describe('Название филиала (название первого филиала)'),
  branchNames: z.array(z.string()).describe('Массив названий филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  status: reportTaskStatusSchema.describe('Статус задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в байтах; null — размер ещё не рассчитан.')
    .nullable(),
  format: fileFormatSchema,
  reportType: reportTypeSchema.optional().describe('Тип отчёта'),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
  canCancel: z.boolean().describe('Можно ли отменить задание'),
  canDelete: z.boolean().describe('Можно ли удалить задание'),
  canStart: z.boolean().describe('Можно ли запустить задание'),
  packageIds: z
    .array(z.uuid())
    .describe('ID пакетов, в которые входит задание (пустой массив = не в пакете)'),
});

export type TaskListItem = z.infer<typeof taskListItemSchema>;

/**
 * Допустимые колонки для сортировки списка заданий (детерминированный набор)
 */
export const taskListSortColumnSchema = z.enum([
  'createdAt',
  'branchId',
  'status',
  'periodStart',
  'periodEnd',
  'updatedAt',
  'branchName',
  'reportType',
  'format',
  'createdBy',
]);
export type TaskListSortColumn = z.infer<typeof taskListSortColumnSchema>;


/** Схема сортировки для списка заданий (колонка — enum) */
export const tasksListSortingSchema = z.object({
  direction: z.enum(['asc', 'desc']).describe('Направление сортировки'),
  column: taskListSortColumnSchema.describe('Колонка для сортировки'),
});

/**
 * Схема фильтров для списка заданий (объект с заранее определённой структурой)
 * Все поля опциональны, можно комбинировать несколько фильтров одновременно
 */
export const tasksListFilterSchema = z.object({
  packageId: z.uuid().nullable().optional().describe('ID пакета (null — задания без пакета)'),
  branchIds: z.array(z.uuid()).optional().describe('Массив идентификаторов филиалов'),
  branchName: z.string().optional().describe('Название филиала'),
  status: reportTaskStatusSchema.optional().describe('Статус задания'),
  reportType: reportTypeSchema.optional().describe('Тип отчёта'),
  format: fileFormatSchema.optional().describe('Формат файла'),
  source: z.string().optional().describe('Источник данных'),
  createdBy: z.string().optional().describe('ФИО создателя задания'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Дата начала отчётного периода (формат: YYYY-MM-DD)'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Дата окончания отчётного периода (формат: YYYY-MM-DD)'),
  createdAt: z.iso.datetime().optional().describe('Дата и время создания (формат: ISO 8601)'),
  updatedAt: z.iso.datetime().optional().describe('Дата и время обновления (формат: ISO 8601)'),
}).optional();

export type TasksListFilter = z.infer<typeof tasksListFilterSchema>;

/**
 * Схема тела запроса POST /api/v1/report-6406/tasks/list (пагинация, сортировка, фильтрация)
 */
export const getTasksRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: tasksListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
  filter: tasksListFilterSchema.describe('Фильтры для списка заданий (объект с опциональными полями)'),
  includedInPackage: z.uuid().optional().describe('UUID пакета - вернуть только задачи, входящие в указанный пакет'),
  excludedInPackage: z.uuid().optional().describe('UUID пакета - вернуть только задачи, НЕ входящие в указанный пакет'),
}).refine(
  (data) => {
    // Параметры взаимоисключающие
    if (data.includedInPackage && data.excludedInPackage) {
      return false;
    }
    return true;
  },
  {
    message: 'includedInPackage and excludedInPackage cannot be used together',
    path: ['includedInPackage'],
  }
);

export type GetTasksRequest = z.infer<typeof getTasksRequestSchema>;

/**
 * Схема для ответа POST /api/v1/report-6406/tasks/list (пагинированный список)
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
  taskIds: z.array(z.uuid()).min(1),
});

export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;

/**
 * Схема для ответа при массовом удалении (с детальными результатами)
 */
export const bulkDeleteResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkDeleteResponse = z.infer<typeof bulkDeleteResponseSchema>;

/**
 * Схема для массовой отмены заданий
 */
export const bulkCancelTasksSchema = z.object({
  taskIds: z.array(z.uuid()).min(1),
});

export type BulkCancelTasksInput = z.infer<typeof bulkCancelTasksSchema>;

/**
 * Схема для ответа при массовой отмене (с детальными результатами)
 */
export const bulkCancelResponseSchema = z.object({
  cancelled: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.uuid(),
    success: z.boolean(),
    status: reportTaskStatusSchema.optional(),
    updatedAt: z.iso.datetime().optional(),
    reason: z.string().optional(),
  })),
});

export type BulkCancelResponse = z.infer<typeof bulkCancelResponseSchema>;

/**
 * Схема для ответа при отмене задания
 */
export const cancelTaskResponseSchema = z.object({
  id: z.uuid(),
  status: reportTaskStatusSchema,
  updatedAt: z.iso.datetime(),
});

export type CancelTaskResponse = z.infer<typeof cancelTaskResponseSchema>;

/**
 * Схема для запуска заданий (одного или нескольких)
 */
export const startTasksSchema = z.object({
  taskIds: z.array(z.uuid()).min(1),
});

export type StartTasksInput = z.infer<typeof startTasksSchema>;

/**
 * Схема для успешного результата запуска задания
 */
export const startTaskResultSchema = z.object({
  taskId: z.uuid(),
  status: reportTaskStatusSchema,
  startedAt: z.iso.datetime(),
});

export type StartTaskResult = z.infer<typeof startTaskResultSchema>;

/**
 * Схема для ошибки запуска задания
 */
export const startTaskErrorSchema = z.object({
  taskId: z.uuid(),
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
