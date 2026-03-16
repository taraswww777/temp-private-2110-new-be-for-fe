import { z } from 'zod';
import { dateRangeRefinement, dateSchema, paginationQuerySchema, zAccountSchema, zAccountSecondOrderSchema, zIdSchema, } from '../common.schema.ts';
import { reportTypeSchema } from '../enums/ReportTypeEnum';
import { currencySchema } from '../enums/CurrencyEnum';
import { FileFormatEnum, fileFormatSchema } from '../enums/FileFormatEnum';
import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { taskStatusSchema } from '../enums/TaskStatusEnum.ts';

export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;


 // TODO Проработать нейминг accountList/ accountPlansList/ accountNumbersList
// Будет только в create и detail, в списке быть не должно
const accountList = z.array(zAccountSchema).optional().describe('Список счетов (20-значные номера)');
// Будет только в create и detail, в списке быть не должно
const accountSecondOrderList = z.array(zAccountSecondOrderSchema).optional().describe('Счета второго порядка (5-значные номера)');

/**
 * Базовая схема задания — все поля, общие для detail, list и create.
 */
export const baseTaskSchema = z.object({
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания'),
  createdBy: z.string().describe('ФИО сотрудника, создавшего задание'),
  branchIdsList: z.array(zIdSchema).min(1).describe('Массив ИД филиалов'),
  reportType: reportTypeSchema.describe('Тип отчёта'),
  periodFrom: dateSchema.optional().describe('Дата начала отчётного периода YYYY-MM-DD'),
  periodTo: dateSchema.optional().describe('Дата окончания отчётного периода YYYY-MM-DD'),
  currencyCode: currencySchema.describe('Валюта (например: RUB, FOREIGN)'),
  fileFormat: fileFormatSchema.describe('Формат файла').default(FileFormatEnum.TXT),
  taskStatus: taskStatusSchema.describe('Статус задания'),
  fileSize: z.number().int().min(0).describe('Размер файла; 0 — ещё не рассчитан'),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
  sourcesList: z.array(zIdSchema).optional().describe('Источники данных'),
  filesCount: z.number().int().min(0).describe('Количество файлов').default(0),
  packageId: zIdSchema.optional().describe('ИД Пакета, в который входит задание'),
});

/**
 * Схема для создания задания.
 * Выведена из baseTaskSchema: omit автогенерируемых полей, currencyCode — optional (по умолчанию RUB).
 * Обязательные: branchIdsList, reportType, fileFormat.
 * periodFrom / periodTo — optional (поддержка открытых интервалов).
 */
export const createTaskSchema = baseTaskSchema
  .omit({
    id: true,
    createdAt: true,
    createdBy: true,
    taskStatus: true,
    fileSize: true,
    updatedAt: true,
    filesCount: true,
    packageId: true,
  })
  .extend({
    accountList,
    accountSecondOrderList,
  })
  .superRefine(dateRangeRefinement());

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * @deprecated
 * Схема для ответа с информацией о пакете в задании
 */
export const taskPackageInfoSchema = z.object({
  id: zIdSchema,
  name: z.string(),
  addedAt: z.iso.datetime(),
});

export type TaskPackageInfo = z.infer<typeof taskPackageInfoSchema>;


/**
 * Единая схема для детальной информации о задании (POST 201 и GET /{id} 200).
 * Расширяет baseTaskSchema дополнительными полями, специфичными для детального представления.
 */
export const taskDetailSchema = baseTaskSchema.extend({
  accountList,
  accountSecondOrderList,
  // TODO: Это поле нужно, а вот что там будет пока не известно
  s3FolderId: z.string().optional().describe('ID папки в S3'),
}).superRefine(dateRangeRefinement());

export type TaskDetails = z.infer<typeof taskDetailSchema>;

/**
 * Схема для элемента списка заданий (TaskListItemDto).
 * Проекция baseTaskSchema — все поля базы, без дополнительных detail-полей.
 */
export const taskListItemSchema = baseTaskSchema;

export type TaskListItem = z.infer<typeof taskListItemSchema>;

/**
 * Допустимые колонки для сортировки списка заданий (детерминированный набор),
 * Набор полей скорее всего изменится
 */
export const taskListSortColumnSchema = z.enum([
  'createdAt',
  'taskStatus',
  'reportType',
  'periodFrom',
  'periodTo',
  'createdBy'
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
  taskStatusList: z.array(taskStatusSchema).optional().describe('Статусы заданий'),
  reportTypeList: z.array(reportTypeSchema).optional().describe('Типы отчётов'),
  fileFormatList: z.array(fileFormatSchema).optional().describe('Форматы файла'),
  sourceIdList: z.array(zIdSchema).optional().describe('Идентификаторы источников данных'),
  createdByList: z.array(z.string()).optional().describe('ФИО создателя задания'),
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
export const bulkDeleteTasksSchema = z.array(zIdSchema).min(1);

export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;

/**
 * Схема для ответа при массовом удалении (с детальными результатами)
 */
export const bulkDeleteResponseSchema = z.object({
  succeeded: z.number().int().min(0).describe('Количество успешно удалённых заданий'),
  failed: z.number().int().min(0).describe('Количество заданий, которые не удалось удалить'),
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
export const bulkCancelTasksSchema = z.array(zIdSchema).min(1);

export type BulkCancelTasksInput = z.infer<typeof bulkCancelTasksSchema>;

/**
 * Схема для ответа при массовой отмене (с детальными результатами)
 */
export const bulkCancelResponseSchema = z.object({
  succeeded: z.number().int().min(0).describe('Количество успешно отменённых заданий'),
  failed: z.number().int().min(0).describe('Количество заданий, которые не удалось отменить'),
  results: z.array(z.object({
    taskId: zIdSchema,
    success: z.boolean(),
    taskStatus: taskStatusSchema.optional(),
    updatedAt: z.iso.datetime().optional(),
    reason: z.string().optional(),
  })),
});

export type BulkCancelResponse = z.infer<typeof bulkCancelResponseSchema>;


/**
 * Схема для запуска заданий (одного или нескольких)
 */
export const startTasksSchema = z.array(zIdSchema).min(1);

export type StartTasksInput = z.infer<typeof startTasksSchema>;

/**
 * Элемент результата запуска (успех/ошибка) — в bulk-формате.
 */
export const startTaskResultSchema = z.object({
  taskId: zIdSchema,
  success: z.boolean(),
  status: taskStatusSchema.optional(),
  startedAt: z.iso.datetime().optional(),
  reason: z.string().optional(),
});

export type StartTaskResult = z.infer<typeof startTaskResultSchema>;

/**
 * Схема для ответа при запуске заданий
 */
export const startTasksResponseSchema = z.object({
  succeeded: z.number().int().min(0).describe('Количество успешно запущенных заданий'),
  failed: z.number().int().min(0).describe('Количество заданий, которые не удалось запустить'),
  results: z.array(startTaskResultSchema),
});

export type StartTasksResponse = z.infer<typeof startTasksResponseSchema>;
