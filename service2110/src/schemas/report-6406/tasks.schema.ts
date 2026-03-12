import { z } from 'zod';
import { paginationQuerySchema, zIdSchema, } from '../common.schema.ts';
import { reportTypeSchema } from '../enums/ReportTypeEnum';
import { currencySchema } from '../enums/CurrencyEnum';
import { FileFormatEnum, fileFormatSchema } from '../enums/FileFormatEnum';
import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { taskStatusSchema } from '../enums/TaskStatusEnum.ts';

export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;

/**
 * Схема для создания задания
 * Поддерживает как branchId (для обратной совместимости), так и branchIds (новый формат)
 */
export const createTaskSchema = z.object({
  branchId: zIdSchema.optional().describe('ИД филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(zIdSchema).min(1).optional().describe('Массив ИД филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода (формат: YYYY-MM-DD)'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода (формат: YYYY-MM-DD)'),
  accountMask: z.string().max(20).optional().describe('Маска счетов для фильтрации'),
  accountSecondOrder: z.string().max(2).optional().describe('Счета второго порядка'),
  currency: currencySchema.optional().describe('Валюта (опционально при создании; по умолчанию RUB)'),
  format: fileFormatSchema,
  reportType: reportTypeSchema,
  source: z.string().max(20).optional().describe('Ссылка на справочник или ИД источника данных'),
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
  id: zIdSchema,
  name: z.string(),
  addedAt: z.iso.datetime(),
});

export type TaskPackageInfo = z.infer<typeof taskPackageInfoSchema>;

/**
 * Схема для полного задания
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
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при создании)'),
  branchIdsList: z.array(zIdSchema).nonoptional().describe('Массив ИД филиалов'),
  reportType: reportTypeSchema.nonoptional().describe('Тип отчёта'),
  periodFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода YYYY-MM-DD'),
  periodTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода YYYY-MM-DD'),
  account: z.array(z.string().length(20)).nullable().describe('Список счетов'),
  accountSecondOrderList: z.array(z.string().length(5)).describe('Счета второго порядка'),
  currencyCode: currencySchema.describe('Валюта (например: RUB, FOREIGN)'),
  fileType: fileFormatSchema.nonoptional().default(FileFormatEnum.TXT),
  sourcesList: z.array(z.number().min(1)).nullable().describe('Ссылка на справочник или ИД источника данных'),
  status: taskStatusSchema.describe('Статус задания'),
  fileSize: z
    .number()
    .int()
    .min(0)
    .describe('Размер файла в мегабайтах. 0 — размер ещё не рассчитан.')
    .default(0),
  filesCount: z
    .number()
    .int()
    .min(0)
    .describe('Количество файлов в задании')
    .default(0),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления 2023-05-15 18:23:58'),
  s3FolderId: z.string().nullable().describe('ID папки в S3'),
  operationTypesList: z.string().nullable().describe('Код типа операции'),
  packageId: z.number().nullable().describe('Пакет, в которые входит задание'),
}).refine(
  (data) => !!data.periodFrom || !!data.periodTo,
  {
    message: 'Должен быть указан хотя бы один из periodFrom или periodTo',
    path: ['periodFrom', 'periodTo'],
  },
);

export type TaskDetails = z.infer<typeof taskDetailsSchema>;

/**
 * Схема для элемента списка заданий (TaskListItemDto)
 */
export const taskListItemSchema = z.object({
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание (всегда заполняется на BE при возврате)'),
  branchId: zIdSchema.describe('ИД филиала (устаревшее поле, используйте branchIds)'),
  branchIds: z.array(zIdSchema).describe('Массив ИД филиалов'),
  branchName: z.string().describe('Название филиала (название первого филиала)'),
  branchNames: z.array(z.string()).describe('Массив названий филиалов'),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата начала отчётного периода'),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата окончания отчётного периода'),
  status: taskStatusSchema.describe('Статус задания'),
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
  packageIds: z.array(zIdSchema).describe('ID пакетов, в которые входит задание (пустой массив = не в пакете)'),
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
  direction: sortOrderSchema,
  column: taskListSortColumnSchema.describe('Колонка для сортировки'),
});

/**
 * Схема фильтров для списка заданий (объект с заранее определённой структурой)
 * Все поля опциональны, можно комбинировать несколько фильтров одновременно
 */
export const tasksListFilterSchema = z.object({
  packageId: zIdSchema.optional().nullable().describe('ID пакета (null — задания без пакета)'),
  branchIds: z.array(zIdSchema).optional().describe('Массив ИД филиалов'),
  statuses: z.array(taskStatusSchema).optional().describe('Статус задания'),
  operationType: z.array(zIdSchema).optional().describe('Тип операции'),
  format: z.array(fileFormatSchema).optional().describe('Формат файла'),
  sourcesList: z.array(zIdSchema).optional().describe('Источник данных'),
  createdBy: z.array(z.string()).optional().describe('ФИО создателя задания'),
  periodFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Дата начала отчётного периода (формат: YYYY-MM-DD)'),
  periodTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Дата окончания отчётного периода (формат: YYYY-MM-DD)'),
  createdAtFrom: z.iso.datetime().optional().describe('Дата и время создания (формат: ISO 8601)'),
  createdAtTo: z.iso.datetime().optional().describe('Дата и время создания (формат: ISO 8601)'),
}).optional();

export type TasksListFilter = z.infer<typeof tasksListFilterSchema>;

/**
 * Схема тела запроса POST /api/v1/report-6406/tasks/list (пагинация, сортировка, фильтрация)
 */
export const getTasksRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: tasksListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
  filter: tasksListFilterSchema.describe('Фильтры для списка заданий (объект с опциональными полями)'),
  includedInPackage: zIdSchema.optional().describe('ID пакета - вернуть только задачи, входящие в указанный пакет'),
  excludedInPackage: zIdSchema.optional().describe('ID пакета - вернуть только задачи, НЕ входящие в указанный пакет'),
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
