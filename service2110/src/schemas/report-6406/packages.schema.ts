import { z } from 'zod';
import { SortOrderEnum, sortOrderSchema } from '../common/SortOrderEnum.ts';
import { packetStatusSchema } from './enums/PackageStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationMetadataSchema, paginationQuerySchema } from '../common/pagination.schema.ts';

/**
 * Базовая схема пакета — все поля, общие для detail, list и create.
 * Используется как основа для всех DTO пакетов.
 */
export const basePackageSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().min(1).max(255).describe('Название пакета'),
  createdAt: z.iso.datetime().describe('Дата и время создания пакета'),
  createdBy: z.string().min(1).max(255).describe('ФИО сотрудника, создавшего пакет'),
  lastCopiedToTfrAt: z.iso.datetime().nullable().describe('Дата последнего копирования в ТФР (ISO 8601)'),
  totalTasksCount: z.number().int().min(0).describe('Количество заданий в пакете').default(0),
  totalFilesSize: z.number().int().min(0).describe('Общий размер пакета в мегабайтах (сумма размеров всех файлов)').default(0),
  updatedAt: z.iso.datetime().describe('Дата и время последнего обновления'),
  status: packetStatusSchema.describe('Текущий статус пакета'),
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
export const packageSortBySchema = z.enum([
  'createdAt',
  'name',
  'tasksCount',
  'totalSize',
]);

export type PackageSortBy = z.infer<typeof packageSortBySchema>;

/**
 * Схема для query параметров списка пакетов (GET /api/v1/report-6406/packages).
 * Включает пагинацию, сортировку и поиск по названию.
 */
export const packagesQuerySchema = paginationQuerySchema.extend({
  sortBy: packageSortBySchema.default('createdAt').describe('Колонка для сортировки'),
  sortOrder: sortOrderSchema.default(SortOrderEnum.DESC).describe('Направление сортировки (ASC/DESC)'),
  search: z.string().optional().describe('Поиск по названию пакета (частичное совпадение)'),
});

export type PackagesQuery = z.infer<typeof packagesQuerySchema>;

/**
 * Схема для ответа GET /api/v1/report-6406/packages (пагинированный список пакетов).
 */
export const packagesListResponseSchema = z.object({
  packages: z.array(packageSchema).describe('Список пакетов'),
  pagination: paginationMetadataSchema.describe('Метаданные пагинации'),
});

export type PackagesListResponse = z.infer<typeof packagesListResponseSchema>;

/**
 * Схема для массового удаления пакетов (DELETE /api/v1/report-6406/packages).
 */
export const bulkDeletePackagesSchema = z.object({
  packageIds: z.array(zIdSchema).min(1).describe('Массив ИД пакетов для удаления (минимум 1)'),
});

export type BulkDeletePackagesInput = z.infer<typeof bulkDeletePackagesSchema>;

/**
 * Схема для ответа при массовом удалении пакетов (с детальными результатами).
 * Возвращает статистику и детали по каждому пакету.
 */
export const bulkDeletePackagesResponseSchema = z.object({
  deleted: z.number().int().min(0).describe('Количество успешно удалённых пакетов'),
  failed: z.number().int().min(0).describe('Количество пакетов, которые не удалось удалить'),
  results: z.array(z.object({
    packageId: zIdSchema.describe('ИД пакета'),
    success: z.boolean().describe('Успешность операции'),
    reason: z.string().optional().describe('Причина ошибки (если success = false)'),
  })).describe('Детальные результаты по каждому пакету'),
});

export type BulkDeletePackagesResponse = z.infer<typeof bulkDeletePackagesResponseSchema>;

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
 * Схема для ответа при добавлении заданий в пакет.
 * Возвращает статистику и детали по каждому заданию.
 */
export const addTasksToPackageResponseSchema = z.object({
  added: z.number().int().min(0).describe('Количество успешно добавленных заданий'),
  alreadyInPackage: z.number().int().min(0).describe('Количество заданий, которые уже были в пакете'),
  notFound: z.number().int().min(0).describe('Количество не найденных заданий'),
  errors: z.array(z.object({
    taskId: zIdSchema.describe('ИД задания'),
    reason: z.string().describe('Причина ошибки'),
  })).describe('Список ошибок при добавлении заданий'),
});

export type AddTasksToPackageResponse = z.infer<typeof addTasksToPackageResponseSchema>;

/**
 * Схема для массового удаления заданий из пакета (DELETE /api/v1/report-6406/packages/{id}/tasks).
 */
export const bulkRemoveTasksFromPackageSchema = z.object({
  taskIds: z.array(zIdSchema).min(1).describe('Массив ИД заданий для удаления из пакета (минимум 1)'),
});

export type BulkRemoveTasksFromPackageInput = z.infer<typeof bulkRemoveTasksFromPackageSchema>;

/**
 * Схема для ответа при массовом удалении заданий из пакета (с детальными результатами).
 * Возвращает статистику и детали по каждому заданию.
 */
export const bulkRemoveTasksResponseSchema = z.object({
  removed: z.number().int().min(0).describe('Количество успешно удалённых заданий'),
  failed: z.number().int().min(0).describe('Количество заданий, которые не удалось удалить'),
  results: z.array(z.object({
    taskId: zIdSchema.describe('ИД задания'),
    success: z.boolean().describe('Успешность операции'),
    reason: z.string().optional().describe('Причина ошибки (если success = false)'),
  })).describe('Детальные результаты по каждому заданию'),
});

export type BulkRemoveTasksResponse = z.infer<typeof bulkRemoveTasksResponseSchema>;

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
