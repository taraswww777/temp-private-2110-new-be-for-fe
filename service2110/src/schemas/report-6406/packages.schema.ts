import { z } from 'zod';
import { paginationQuerySchema, sortOrderSchema, paginationResponseSchema } from '../common.schema';
import { taskListItemSchema } from './tasks.schema';

/**
 * Схема для создания пакета
 */
export const createPackageSchema = z.object({
  name: z.string().min(1).max(255),
  createdBy: z.string().min(1).max(255),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;

/**
 * Схема для обновления пакета
 */
export const updatePackageSchema = z.object({
  name: z.string().min(1).max(255),
});

export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;

/**
 * Схема для полного пакета
 */
export const packageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  createdBy: z.string(),
  lastCopiedToTfrAt: z.string().datetime().nullable(),
  tasksCount: z.number().int().min(0),
  totalSize: z
    .number()
    .int()
    .min(0)
    .describe('Общий размер пакета в байтах, например 157286400 = 150 MB (сумма размеров всех файлов)'),
  updatedAt: z.string().datetime(),
});

export type Package = z.infer<typeof packageSchema>;

/**
 * Схема для задания в пакете (расширенная с addedAt)
 */
export const packageTaskItemSchema = taskListItemSchema.extend({
  addedAt: z.string().datetime(),
});

export type PackageTaskItem = z.infer<typeof packageTaskItemSchema>;

/**
 * Схема для детального пакета (с заданиями)
 */
export const packageDetailSchema = packageSchema.extend({
  tasks: z.array(packageTaskItemSchema),
  tasksPagination: paginationResponseSchema,
});

export type PackageDetail = z.infer<typeof packageDetailSchema>;

/**
 * Схема для query параметров списка пакетов
 */
export const packagesQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['createdAt', 'name', 'tasksCount', 'totalSize']).default('createdAt'),
  sortOrder: sortOrderSchema,
  search: z.string().optional(),
});

export type PackagesQuery = z.infer<typeof packagesQuerySchema>;

/**
 * Схема для query параметров заданий в пакете
 */
export const packageTasksQuerySchema = z.object({
  tasksPage: z.coerce.number().int().min(0).default(0),
  tasksLimit: z.coerce.number().int().min(1).max(100).default(20),
  tasksSortBy: z.enum(['createdAt', 'branchId', 'status', 'periodStart']).default('createdAt'),
  tasksSortOrder: sortOrderSchema,
});

export type PackageTasksQuery = z.infer<typeof packageTasksQuerySchema>;

/**
 * Схема для ответа со списком пакетов
 */
export const packagesListResponseSchema = z.object({
  packages: z.array(packageSchema),
  pagination: paginationResponseSchema,
});

export type PackagesListResponse = z.infer<typeof packagesListResponseSchema>;

/**
 * Схема для массового удаления пакетов
 */
export const bulkDeletePackagesSchema = z.object({
  packageIds: z.array(z.string().uuid()).min(1),
});

export type BulkDeletePackagesInput = z.infer<typeof bulkDeletePackagesSchema>;

/**
 * Схема для ответа при массовом удалении пакетов (с детальными результатами)
 */
export const bulkDeletePackagesResponseSchema = z.object({
  deleted: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    packageId: z.string().uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkDeletePackagesResponse = z.infer<typeof bulkDeletePackagesResponseSchema>;

/**
 * Схема для ответа при обновлении пакета
 */
export const updatePackageResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  updatedAt: z.string().datetime(),
});

export type UpdatePackageResponse = z.infer<typeof updatePackageResponseSchema>;

/**
 * Схема для добавления заданий в пакет
 */
export const addTasksToPackageSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
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
    taskId: z.string().uuid(),
    reason: z.string(),
  })),
});

export type AddTasksToPackageResponse = z.infer<typeof addTasksToPackageResponseSchema>;

/**
 * Схема для массового удаления заданий из пакета
 */
export const bulkRemoveTasksFromPackageSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1),
});

export type BulkRemoveTasksFromPackageInput = z.infer<typeof bulkRemoveTasksFromPackageSchema>;

/**
 * Схема для ответа при массовом удалении заданий из пакета (с детальными результатами)
 */
export const bulkRemoveTasksResponseSchema = z.object({
  removed: z.number().int().min(0),
  failed: z.number().int().min(0),
  results: z.array(z.object({
    taskId: z.string().uuid(),
    success: z.boolean(),
    reason: z.string().optional(),
  })),
});

export type BulkRemoveTasksResponse = z.infer<typeof bulkRemoveTasksResponseSchema>;

/**
 * Схема для ответа при копировании пакета в ТФР
 */
export const copyToTfrResponseSchema = z.object({
  id: z.string().uuid(),
  lastCopiedToTfrAt: z.string().datetime(),
  message: z.string(),
});

export type CopyToTfrResponse = z.infer<typeof copyToTfrResponseSchema>;
