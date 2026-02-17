import { z } from 'zod';
import { paginationQuerySchema, paginationMetadataSchema } from '../common.schema';
import { SortOrderEnum, sortOrderSchema } from '../enums/SortOrderEnum';

/**
 * Схема для создания пакета
 */
export const createPackageSchema = z.object({
  name: z.string().min(1).max(255).describe('Название пакета'),
  createdBy: z.string().min(1).max(255).describe('Создатель пакета'),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

/**
 * Схема для обновления пакета
 */
export const updatePackageSchema = z.object({
  name: z.string().min(1).max(255).describe('Новое название пакета'),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

/**
 * Схема для полного пакета
 */
export const packageSchema = z.object({
  id: z.uuid().describe('Уникальный идентификатор пакета'),
  name: z.string().describe('Название пакета'),
  createdAt: z.string().datetime().describe('Дата создания пакета'),
  createdBy: z.string().describe('Создатель пакета'),
  lastCopiedToTfrAt: z.string().datetime().nullable().describe('Дата последнего копирования в ТФР'),
  tasksCount: z.number().int().min(0).describe('Количество заданий в пакете'),
  totalSize: z
    .number()
    .int()
    .min(0)
    .describe('Общий размер пакета в байтах (сумма размеров всех файлов). Всегда число; 0 при пустом пакете.'),
  updatedAt: z.string().datetime().describe('Дата последнего обновления'),
});

export type Package = z.infer<typeof packageSchema>;

/**
 * Схема для query параметров списка пакетов
 */
export const packagesQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['createdAt', 'name', 'tasksCount', 'totalSize']).default('createdAt'),
  sortOrder: sortOrderSchema.default(SortOrderEnum.DESC),
  search: z.string().optional(),
});

export type PackagesQuery = z.infer<typeof packagesQuerySchema>;

/**
 * Схема для ответа со списком пакетов
 */
export const packagesListResponseSchema = z.object({
  packages: z.array(packageSchema),
  pagination: paginationMetadataSchema,
});

export type PackagesListResponse = z.infer<typeof packagesListResponseSchema>;

/**
 * Схема для массового удаления пакетов
 */
export const bulkDeletePackagesSchema = z.object({
  packageIds: z.array(z.uuid()).min(1),
});

export type BulkDeletePackagesInput = z.infer<typeof bulkDeletePackagesSchema>;

/**
 * Схема для ответа при массовом удалении пакетов (с детальными результатами)
 */
export const bulkDeletePackagesResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    packageId: z.uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkDeletePackagesResponse = z.infer<typeof bulkDeletePackagesResponseSchema>;

/**
 * Схема для ответа при обновлении пакета
 */
export const updatePackageResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  updatedAt: z.string().datetime(),
});

export type UpdatePackageResponse = z.infer<typeof updatePackageResponseSchema>;

/**
 * Схема для добавления заданий в пакет
 */
export const addTasksToPackageSchema = z.object({
  taskIds: z.array(z.uuid()).min(1),
});

export type AddTasksToPackageInput = z.infer<typeof addTasksToPackageSchema>;

/**
 * Схема для ответа при добавлении заданий в пакет
 */
export const addTasksToPackageResponseSchema = z.object({
  added: z.number().int().min(0),
  alreadyInPackage: z.number().int().min(0),
  notFound: z.number().int().min(0),
  errors: z.array(z.object({
    taskId: z.uuid(),
    reason: z.string(),
  })),
});

export type AddTasksToPackageResponse = z.infer<typeof addTasksToPackageResponseSchema>;

/**
 * Схема для массового удаления заданий из пакета
 */
export const bulkRemoveTasksFromPackageSchema = z.object({
  taskIds: z.array(z.uuid()).min(1),
});

export type BulkRemoveTasksFromPackageInput = z.infer<typeof bulkRemoveTasksFromPackageSchema>;

/**
 * Схема для ответа при массовом удалении заданий из пакета (с детальными результатами)
 */
export const bulkRemoveTasksResponseSchema = z.object({
  removed: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkRemoveTasksResponse = z.infer<typeof bulkRemoveTasksResponseSchema>;

/**
 * Схема для ответа при копировании пакета в ТФР
 */
export const copyToTfrResponseSchema = z.object({
  id: z.uuid(),
  lastCopiedToTfrAt: z.string().datetime(),
  message: z.string(),
});

export type CopyToTfrResponse = z.infer<typeof copyToTfrResponseSchema>;
