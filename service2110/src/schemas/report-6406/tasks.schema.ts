import { z } from 'zod';
import { dateRangeRefinement, dateSchema, paginationQuerySchema, zIdSchema, } from '../common.schema.ts';
import { reportTypeSchema } from '../enums/ReportTypeEnum';
import { currencySchema } from '../enums/CurrencyEnum';
import { FileFormatEnum, fileFormatSchema } from '../enums/FileFormatEnum';
import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { taskStatusSchema } from '../enums/TaskStatusEnum.ts';

export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;

/**
 * Базовая схема задания — все поля, общие для detail, list и create.
 */
export const baseTaskSchema = z.object({
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание'),
  branchIdsList: z.array(zIdSchema).min(1).describe('Массив ИД филиалов'),
  reportType: reportTypeSchema.describe('Тип отчёта'),
  periodFrom: dateSchema.nullable().describe('Дата начала отчётного периода YYYY-MM-DD'),
  periodTo: dateSchema.nullable().describe('Дата окончания отчётного периода YYYY-MM-DD'),
  currencyCode: currencySchema.describe('Валюта (например: RUB, FOREIGN)'),
  fileType: fileFormatSchema.describe('Формат файла'),
  status: taskStatusSchema.describe('Статус задания'),
  fileSize: z.number().int().min(0).describe('Размер файла; 0 — ещё не рассчитан'),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
  accountsList: z.array(z.string().length(20).regex(/^\d+$/)).nullable().describe('Список счетов (20-значные номера)'),
  accountSecondOrderList: z.array(z.string().length(5).regex(/^\d+$/)).nullable().describe('Счета второго порядка (5-значные номера)'),
  operationTypesList: z.array(zIdSchema).nullable().describe('Типы операций'),
  sourcesList: z.array(zIdSchema).nullable().describe('Источники данных'),
  filesCount: z.number().int().min(0).describe('Количество файлов').default(0),
  packageId: zIdSchema.nullable().describe('Пакет, в который входит задание'),
});

/**
 * Схема для создания задания.
 * Выведена из baseTaskSchema: omit автогенерируемых полей, currencyCode — optional (по умолчанию RUB).
 * Обязательные: branchIdsList, reportType, fileType.
 * periodFrom / periodTo — optional (поддержка открытых интервалов).
 */
export const createTaskSchema = baseTaskSchema
  .omit({
    id: true,
    createdAt: true,
    createdBy: true,
    status: true,
    fileSize: true,
    updatedAt: true,
    filesCount: true,
    packageId: true,
  })
  .extend({
    periodFrom: dateSchema.optional().describe('Дата начала отчётного периода YYYY-MM-DD'),
    periodTo: dateSchema.optional().describe('Дата окончания отчётного периода YYYY-MM-DD'),
    currencyCode: currencySchema.optional().describe('Валюта (опционально; по умолчанию RUB)'),
    accountsList: z.array(z.string().length(20).regex(/^\d+$/)).optional().describe('Список счетов (20-значные номера)'),
    accountSecondOrderList: z.array(z.string().length(5).regex(/^\d+$/)).optional().describe('Счета второго порядка (5-значные номера)'),
    operationTypesList: z.array(zIdSchema).optional().describe('Типы операций'),
  })
  .superRefine(dateRangeRefinement());

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Схема для ответа с информацией о пакете в задании
 */
export const taskPackageInfoSchema = z.object({
  id: zIdSchema,
  name: z.string(),
  addedAt: z.iso.datetime(),
});

export type TaskPackageInfo = z.infer<typeof taskPackageInfoSchema>;

/**
 * @deprecated Устаревшая схема задания со старыми полями (branchId, branchName, periodStart/End и др.).
 * Используйте taskDetailSchema (деталь) или taskListItemSchema (список) вместо неё.
 * Будет удалена после перевода всех потребителей на новые DTO.
 */
export const taskSchema = z.object({
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании)'),
  branchId: zIdSchema.describe('ИД филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(zIdSchema).describe('Массив ИД филиалов'),
  branchName: z.string().describe('Название филиала (название первого филиала)'),
  branchNames: z.array(z.string()).describe('Массив названий филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  accountMask: z.string().nullable().describe('Маска счетов для фильтрации'),
  accountSecondOrder: z.string().nullable().describe('Счета второго порядка'),
  currency: currencySchema,
  format: fileFormatSchema,
  reportType: reportTypeSchema.optional().describe('Тип отчёта'),
  source: z.string().nullable().describe('Ссылка на справочник или ИД источника данных'),
  status: taskStatusSchema,
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

/** @deprecated Используйте TaskDetails или TaskListItem */
export type Task = z.infer<typeof taskSchema>;

/**
 * Единая схема для детальной информации о задании (POST 201 и GET /{id} 200).
 * Расширяет baseTaskSchema дополнительными полями, специфичными для детального представления.
 */
export const taskDetailSchema = baseTaskSchema.extend({
  fileSize: z.number().int().min(0).describe('Размер файла; 0 — ещё не рассчитан').default(0),
  fileType: fileFormatSchema.describe('Формат файла').default(FileFormatEnum.TXT),
  s3FolderId: z.string().nullable().describe('ID папки в S3'),
}).superRefine(dateRangeRefinement());

export type TaskDetails = z.infer<typeof taskDetailSchema>;

/**
 * Схема для элемента списка заданий (TaskListItemDto).
 * Проекция baseTaskSchema — все поля базы, без дополнительных detail-полей.
 */
export const taskListItemSchema = baseTaskSchema;

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
  direction: sortOrderSchema,
  column: taskListSortColumnSchema.describe('Колонка для сортировки'),
});

/**
 * Схема фильтров для списка заданий.
 * Имена полей согласованы с baseTaskSchema.
 * Все поля optional — отсутствие поля (undefined/null) означает, что оно не участвует в фильтрации.
 */
export const tasksListFilterSchema = z.object({
  packageId: zIdSchema.optional().describe('ID пакета'),
  branchIdsList: z.array(zIdSchema).optional().describe('Массив ИД филиалов'),
  statuses: z.array(taskStatusSchema).optional().describe('Статусы заданий'),
  operationTypesList: z.array(zIdSchema).optional().describe('Типы операций'),
  fileType: z.array(fileFormatSchema).optional().describe('Формат файла'),
  sourcesList: z.array(zIdSchema).optional().describe('Источники данных'),
  createdBy: z.array(z.string()).optional().describe('ФИО создателя задания'),
  periodFrom: dateSchema.optional().describe('Дата начала отчётного периода YYYY-MM-DD'),
  periodTo: dateSchema.optional().describe('Дата окончания отчётного периода YYYY-MM-DD'),
  createdAtFrom: z.iso.datetime().optional().describe('Дата создания от (ISO 8601)'),
  createdAtTo: z.iso.datetime().optional().describe('Дата создания до (ISO 8601)'),
}).optional();

export type TasksListFilter = z.infer<typeof tasksListFilterSchema>;

/**
 * Схема тела запроса POST /api/v1/report-6406/tasks/list (пагинация, сортировка, фильтрация)
 */
export const getTasksRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: tasksListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
  filter: tasksListFilterSchema.describe('Фильтры для списка заданий (объект с опциональными полями)'),
});

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
  taskIds: z.array(zIdSchema).min(1),
});

export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;

/**
 * Схема для ответа при массовом удалении (с детальными результатами)
 */
export const bulkDeleteResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: zIdSchema,
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkDeleteResponse = z.infer<typeof bulkDeleteResponseSchema>;

/**
 * Схема для массовой отмены заданий
 */
export const bulkCancelTasksSchema = z.object({
  taskIds: z.array(zIdSchema).min(1),
});

export type BulkCancelTasksInput = z.infer<typeof bulkCancelTasksSchema>;

/**
 * Схема для ответа при массовой отмене (с детальными результатами)
 */
export const bulkCancelResponseSchema = z.object({
  cancelled: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: zIdSchema,
    success: z.boolean(),
    status: taskStatusSchema.optional(),
    updatedAt: z.iso.datetime().optional(),
    reason: z.string().optional(),
  })),
});

export type BulkCancelResponse = z.infer<typeof bulkCancelResponseSchema>;

/**
 * Схема для ответа при отмене задания
 */
export const cancelTaskResponseSchema = z.object({
  id: zIdSchema,
  status: taskStatusSchema,
  updatedAt: z.iso.datetime(),
});

export type CancelTaskResponse = z.infer<typeof cancelTaskResponseSchema>;

/**
 * Схема для запуска заданий (одного или нескольких)
 */
export const startTasksSchema = z.object({
  taskIds: z.array(zIdSchema).min(1),
});

export type StartTasksInput = z.infer<typeof startTasksSchema>;

/**
 * Схема для успешного результата запуска задания
 */
export const startTaskResultSchema = z.object({
  taskId: zIdSchema,
  status: taskStatusSchema,
  startedAt: z.iso.datetime(),
});

export type StartTaskResult = z.infer<typeof startTaskResultSchema>;

/**
 * Схема для ошибки запуска задания
 */
export const startTaskErrorSchema = z.object({
  taskId: zIdSchema,
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
