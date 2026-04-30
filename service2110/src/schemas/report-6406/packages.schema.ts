import { z } from 'zod';
import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { packageStatusSchema } from './enums/PackageStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { taskListSortColumnSchema } from './tasks.schema.ts';

/**
 * Базовая схема пакета — все поля, общие для detail, list и create.
 * Используется как основа для всех DTO пакетов.
 */
export const basePackageSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().min(1).max(255).describe('Название пакета'),
  createdAt: z.iso.datetime().describe('Дата и время создания пакета'),
  createdBy: z.string().min(1).max(255).describe('Логин сотрудника, создавшего пакет'),
  lastCopiedToTfrAt: z.iso.datetime().nullable().describe('Дата последнего копирования в ТФР (ISO 8601), например  2026-04-30T12:20:50.979Z'),
  totalTasksCount: z.number().int().min(0).describe('Количество заданий в пакете').default(0),
  totalFilesSize: z.number().int().min(0).describe('Общий размер пакета в мегабайтах (сумма размеров всех файлов)').default(0),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления, например  2026-04-30T12:20:50.979Z'),
  status: packageStatusSchema.describe('Текущий статус пакета'),
});

/**
 * Схема для создания пакета.
 * Выведена из basePackageSchema: omit автогенерируемых полей.
 * Обязательные: name, createdBy.
 */
export const createPackageSchema = basePackageSchema
  .pick({ name: true });

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

/**
 * Схема для обновления пакета.
 * Позволяет изменить только название пакета.
 */
export const updatePackageSchema = z.object({
  name: z.string().min(1).max(255).describe('Новое название пакета'),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

/**
 * Единая схема для детальной информации о пакете (POST 201, GET /{id} 200, список).
 * Полная проекция basePackageSchema — все поля базы.
 */
export const packageSchema = basePackageSchema;

export type Package = z.infer<typeof packageSchema>;

/**
 * Допустимые колонки для сортировки списка пакетов (детерминированный набор).
 */
export const packageListSortColumnSchema = z.enum([
  'createdAt',
  'name',
  'tasksCount',
  'totalSize',
]);


/** Схема сортировки для списка заданий (колонка — enum) */
export const packageListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: taskListSortColumnSchema.describe('Колонка для сортировки'),
}).describe('Параметры сортировки (колонка — фиксированный набор)');


/**
 * Схема фильтров для списка заданий.
 * Имена полей согласованы с baseTaskSchema.
 * Все поля optional — отсутствие поля (undefined/null) означает, что оно не участвует в фильтрации.
 */
export const packageListFilterSchema = z.object({
  packageId: zIdSchema.optional().describe('ID пакета'),
  name: z.string().describe('Наименование пакета').optional(),
  packageStatus: z.array(packageStatusSchema).optional().describe('Статусы заданий'),
  createdAtFrom: z.iso.datetime().optional().describe('Дата создания от (ISO 8601) 2026-04-30T11:56:16.055Z'),
  createdAtTo: z.iso.datetime().optional().describe('Дата создания до (ISO 8601) 2026-04-30T11:56:16.055Z'),

  copiedFrom: z.iso.datetime().optional().describe('Дата создания от (ISO 8601) 2026-04-30T11:56:16.055Z'),
  copiedTo: z.iso.datetime().optional().describe('Дата создания до (ISO 8601) 2026-04-30T11:56:16.055Z'),

  isEmpty: z.boolean().default(false).optional().describe('Показать пустые пакеты'),
  /** без интеграции с карточкой фл этот фильтр createdByList не получится сделать нормально, будет много дефектов */
  createdByList: z.array(z.string()).optional().describe('Логин создателя пакета'),
}).optional();

/**
 * Схема для query параметров списка пакетов (GET /api/v1/report-6406/packages).
 * Включает пагинацию, сортировку и поиск по названию.
 */
export const getPackageListRequestSchema = paginationQuerySchema.extend({
  pagination: paginationQuerySchema,
  sorting: packageListSortingSchema,
  filter: packageListFilterSchema,
});

/**
 * Схема для ответа GET /api/v1/report-6406/packages (пагинированный список пакетов).
 */
export const getPackageListResponseSchema = z.object({
  items: z.array(packageSchema).describe('Список пакетов'),
  totalItems: z.number().int().min(0).describe('Общее количество заданий'),
});

export type PackagesListResponse = z.infer<typeof getPackageListResponseSchema>;


/**
 * Схема для ответа при обновлении пакета (PUT /api/v1/report-6406/packages/{id}).
 * Возвращает обновлённые данные пакета.
 */
export const updatePackageResponseSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().describe('Обновлённое название пакета'),
  updatedAt: z.iso.datetime().describe('Дата и время обновления'),
});

export type UpdatePackageResponse = z.infer<typeof updatePackageResponseSchema>;

/**
 * Схема для добавления заданий в пакет (POST /api/v1/report-6406/packages/{id}/tasks).
 */
export const addTasksToPackageSchema = z.object({
  taskIds: z.array(zIdSchema).min(1).describe('Массив ИД заданий для добавления в пакет (минимум 1)'),
});

export type AddTasksToPackageInput = z.infer<typeof addTasksToPackageSchema>;

/**
 * Схема для ответа при копировании пакета в ТФР (POST /api/v1/report-6406/packages/{id}/copy-to-tfr).
 * Возвращает информацию об успешном копировании.
 */
export const copyToTfrResponseSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  lastCopiedToTfrAt: z.iso.datetime().describe('Дата и время последнего копирования в ТФР'),
  message: z.string().describe('Сообщение о результате операции'),
});

export type CopyToTfrResponse = z.infer<typeof copyToTfrResponseSchema>;
