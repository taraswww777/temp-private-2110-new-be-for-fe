import { z } from 'zod';
import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { packageStatusSchema } from './enums/PackageStatusEnum.ts';
import { packageListSortColumnSchema } from './enums/PackageListSortColumnEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';
import { dateTimeSchema } from '../common/dateString.schema.ts';

/**
 * Базовая схема пакета — все поля, общие для detail, list и create.
 * Используется как основа для всех DTO пакетов.
 */
export const basePackageSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().min(1).max(255).describe('Название пакета'),
  createdAt: dateTimeSchema.describe('Дата и время создания пакета, например 2026-04-30T12:20:50.979Z'),
  createdBy: z.string().min(1).max(255).describe('Логин сотрудника, создавшего пакет'),
  lastCopiedToTfrAt: dateTimeSchema.nullable().describe('Дата последнего копирования в ТФР (ISO 8601), например  2026-04-30T12:20:50.979Z'),
  totalFilesSize: z.number().int().min(0).describe('Общий размер пакета в мегабайтах (сумма размеров всех файлов)').default(0),
  updatedAt: dateTimeSchema.describe('Дата и время последнего обновления, например  2026-04-30T12:20:50.979Z'),
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
 * Только packageId в path (маршруты add/remove задач в пакете).
 */
export const packageIdPathParamSchema = z.object({
  packageId: zIdSchema.describe('ИД пакета'),
});

export { packageListSortColumnSchema };

/** Схема сортировки для списка заданий (колонка — enum) */
export const packageListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: packageListSortColumnSchema.describe('Колонка для сортировки'),
}).describe('Параметры сортировки (колонка — фиксированный набор)');

/**
 * Фильтры списка пакетов (PackFilterDto по новому OAS).
 */
export const packFilterSchema = z.object({
  name: z.string().max(255).optional().describe('Наименование пакета'),
  status: z.array(packageStatusSchema).optional().describe('Статусы пакета'),
  createdFrom: dateTimeSchema.optional(),
  createdTo: dateTimeSchema.optional(),
  createdBy: z.array(z.string()).optional().describe('Логины создателей пакета'),
  isEmpty: z.boolean().optional().describe('Показать пустые пакеты'),
});

export type PackFilter = z.infer<typeof packFilterSchema>;

/** @deprecated используйте packFilterSchema */
export const packageListFilterSchema = packFilterSchema;

/**
 * Схема тела POST /api/v1/report-6406/packages/list (GetPacksRequestDto).
 */
export const getPackageListRequestSchema = z.object({
  pagination: paginationQuerySchema,
  sorting: packageListSortingSchema,
  filter: packFilterSchema,
});

/**
 * Элемент списка пакетов (PackListItemDto).
 */
export const packListItemSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().max(255).describe('Название пакета'),
  status: packageStatusSchema.describe('Текущий статус пакета'),
  totalFilesSize: z.number().int().min(0).describe('Общий размер пакета в мегабайтах').default(0),
  lastCopiedToTfrAt: dateTimeSchema.nullable().describe('Дата последнего копирования в ТФР (ISO 8601), например 2026-04-30T12:20:50.979Z'),
  createdAt: dateTimeSchema.describe('Дата и время создания пакета, например 2026-04-30T12:20:50.979Z'),
  createdBy: z.string().max(255).describe('Логин создателя пакета'),
});

export type PackListItem = z.infer<typeof packListItemSchema>;

/**
 * Ответ POST /api/v1/report-6406/packages/list (PacksListResponseDto).
 */
export const packsListResponseSchema = z.object({
  results: z.array(packListItemSchema).describe('Список пакетов'),
  totalItems: z.number().int().min(0).describe('Общее количество пакетов'),
});

export type PacksListResponse = z.infer<typeof packsListResponseSchema>;

/** @deprecated используйте packsListResponseSchema */
export const getPackageListResponseSchema = packsListResponseSchema;

export type PackagesListResponse = z.infer<typeof getPackageListResponseSchema>;

/**
 * Схема для ответа при обновлении пакета (PUT /api/v1/report-6406/packages/{id}).
 * Возвращает обновлённые данные пакета.
 */
export const updatePackageResponseSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  name: z.string().describe('Обновлённое название пакета'),
  updatedAt: dateTimeSchema.describe('Дата и время обновления, например 2026-04-30T12:20:50.979Z'),
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
 * Запрос на передачу/удаление пакетов в TFR (PackTransferRequest).
 */
export const packTransferRequestSchema = z.object({
  packIds: z.array(zIdSchema).min(1).describe('Идентификаторы пакетов'),
});

export type PackTransferRequest = z.infer<typeof packTransferRequestSchema>;

/**
 * Схема для ответа при копировании пакета в ТФР (POST /api/v1/report-6406/packages/{id}/copy-to-tfr).
 * Возвращает информацию об успешном копировании.
 */
export const copyToTfrResponseSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  lastCopiedToTfrAt: dateTimeSchema.describe('Дата и время последнего копирования в ТФР, например 2026-04-30T12:20:50.979Z'),
  message: z.string().describe('Сообщение о результате операции'),
});

export type CopyToTfrResponse = z.infer<typeof copyToTfrResponseSchema>;

/**
 * Информация о пакете в TFR (PackTfrInfoDto).
 */
export const packTfrInfoSchema = z.object({
  packId: zIdSchema.describe('ИД пакета'),
  packName: z.string().max(255).describe('Имя пакета'),
  tfrCopyDate: z.string().max(255).describe('Дата копирования в TFR, например 2026-04-30T12:20:50.979Z'),
  size: z.number().int().min(0).describe('Размер пакета в мегабайтах').default(0),
});

export type PackTfrInfo = z.infer<typeof packTfrInfoSchema>;

/** @deprecated используйте packTfrInfoSchema */
export const packageTfrResponseSchema = packTfrInfoSchema;

(function registerPackagesReport6406OpenApi() {
  registerReport6406OpenApiSchema(packageIdPathParamSchema, 'PackageIdPathParamDto');
  registerReport6406OpenApiSchema(packageListSortColumnSchema, 'PackageListSortColumnEnum');
  registerReport6406OpenApiSchema(packageListSortingSchema, 'PackageListSortingDto');
  registerReport6406OpenApiSchema(packFilterSchema, 'PackFilterDto');
  registerReport6406OpenApiSchema(createPackageSchema, 'CreatePackageDto');
  registerReport6406OpenApiSchema(updatePackageSchema, 'UpdatePackageDto');
  registerReport6406OpenApiSchema(packageSchema, 'PackageDto');
  registerReport6406OpenApiSchema(getPackageListRequestSchema, 'GetPacksRequestDto');
  registerReport6406OpenApiSchema(packListItemSchema, 'PackListItemDto');
  registerReport6406OpenApiSchema(packsListResponseSchema, 'PacksListResponseDto');
  registerReport6406OpenApiSchema(updatePackageResponseSchema, 'UpdatePackageResponseDto');
  registerReport6406OpenApiSchema(addTasksToPackageSchema, 'AddTasksToPackageRequestDto');
  registerReport6406OpenApiSchema(packTransferRequestSchema, 'PackTransferRequest');
  registerReport6406OpenApiSchema(copyToTfrResponseSchema, 'CopyToTfrResponseDto');
  registerReport6406OpenApiSchema(packTfrInfoSchema, 'PackTfrInfoDto');
})();
