import { z } from 'zod';
import { zAccountSchema, zAccountSecondOrderSchema } from '../common.schema.ts';
import { reportTypeSchema } from './enums/ReportTypeEnum.ts';
import { currencyIdSchema, currencySchema } from './enums/CurrencyEnum.ts';
import { FileFormatEnum, fileFormatSchema } from './enums/FileFormatEnum.ts';
import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { taskStatusSchema } from './enums/TaskStatusEnum.ts';
import { dateRangeRefinement, dateSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { branchSchema, sourceSchema } from './references.schema.ts';

export type CurrencyType = z.infer<typeof currencySchema>;
export type FileFormatType = z.infer<typeof fileFormatSchema>;


 // TODO Проработать нейминг accountList/ accountPlansList/ accountNumbersList
// Будет только в create и detail и в фильтрах, в списке быть не должно
const accountList = z.array(zAccountSchema).optional().describe('Список счетов (20-значные номера)');
// Будет только в create и detail и в фильтрах, в списке быть не должно
const secondOrderAccountList = z.array(zAccountSecondOrderSchema).optional().describe('Счета второго порядка (5-значные номера)');

/** Есть только в create и filter */
const operationTypeList =  z.array(reportTypeSchema).describe('Тип операции');
/** Есть везде кроме create и filter */
const operationType = reportTypeSchema.describe('Тип операции');

/**
 * Базовая схема задания — все поля, общие для detail, list и create.
 */
export const baseTaskSchema = z.object({
  id: zIdSchema.describe('ИД задания'),
  createdAt: z.iso.datetime().describe('Дата и время создания 2026-04-30T07:46:40.449Z'),
  createdBy: z.string().describe('Логин сотрудника, создавшего задание'),
  branchList: z.array(branchSchema).min(1).describe('Массив ИД филиалов').nonempty(),
  periodFrom: dateSchema.optional().describe('Дата начала отчётного периода 2023-01-01'),
  periodTo: dateSchema.optional().describe('Дата окончания отчётного периода 2023-12-31'),
  currencyId: currencyIdSchema.describe('Ид валюты (например: 810, 999)'),
  fileFormat: fileFormatSchema.describe('Формат файла').default(FileFormatEnum.TXT),
  taskStatus: taskStatusSchema.describe('Статус задания'),
  totalFilesSize: z.number().int().min(0).describe('Размер файла; 0 — ещё не рассчитан').default(0),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления 2026-04-30T07:46:40.449Z'),
  sourceList: z.array(sourceSchema).optional().describe('Источники данных'),
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
    totalFilesSize: true,
    updatedAt: true,
    filesCount: true,
    packageId: true,
  })
  .extend({
    accountList,
    secondOrderAccountList,
    operationTypeList,
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
  secondOrderAccountList,
  operationType,
  s3Path: z.string().optional().describe('ID папки в S3'),
}).superRefine(dateRangeRefinement());

export type TaskDetails = z.infer<typeof taskDetailSchema>;

/**
 * Схема для элемента списка заданий (TaskListItemDto).
 * Проекция baseTaskSchema — все поля базы, без дополнительных detail-полей.
 */
export const taskListItemSchema = baseTaskSchema.extend({
  operationType
});

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
  sortOrder: sortOrderSchema,
  sortBy: taskListSortColumnSchema.describe('Колонка для сортировки'),
});

/**
 * Схема фильтров для списка заданий.
 * Имена полей согласованы с baseTaskSchema.
 * Все поля optional — отсутствие поля (undefined/null) означает, что оно не участвует в фильтрации.
 */
export const tasksListFilterSchema = z.object({
  packageId: zIdSchema.optional().describe('ID пакета'),
  operationTypeList: z.array(reportTypeSchema).optional().describe('Типы отчётов'),
  branchIdList: z.array(zIdSchema).optional().describe('Массив ИД филиалов'),
  taskStatusList: z.array(taskStatusSchema).optional().describe('Статусы заданий'),
  fileFormatList: z.array(fileFormatSchema).optional().describe('Форматы файла'),
  sourceIdList: z.array(zIdSchema).optional().describe('Идентификаторы источников данных'),
  accountList,
  secondOrderAccountList,
  currencyIdList: z.array(currencyIdSchema).optional(),
  /** без интеграции с карточкой фл этот фильтр createdByList не получится сделать нормально, будет много дефектов */
  createdByList: z.array(z.string()).optional().describe('Логин создателя пакета'),
  periodFrom: dateSchema.optional().describe('Дата начала отчётного периода YYYY-MM-DD'),
  periodTo: dateSchema.optional().describe('Дата окончания отчётного периода YYYY-MM-DD'),
  createdAtFrom: z.iso.datetime().optional().describe('Дата создания от (ISO 8601) 2026-04-30T11:56:16.055Z'),
  createdAtTo: z.iso.datetime().optional().describe('Дата создания до (ISO 8601) 2026-04-30T11:56:16.055Z'),
}).optional();

export type TasksListFilter = z.infer<typeof tasksListFilterSchema>;

/**
 * Схема тела запроса POST /api/v1/report-6406/tasks/list (пагинация, сортировка, фильтрация)
 */
export const getTasksRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: tasksListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
  filter: tasksListFilterSchema,
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

