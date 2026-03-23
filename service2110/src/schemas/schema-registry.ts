/**
 * Реестр Zod-схем для автоматической генерации $ref в OpenAPI.
 *
 * Используется fastify-type-provider-zod: зарегистрированные здесь схемы
 * автоматически попадают в components.schemas и заменяются на $ref-ссылки
 * в описаниях роутов.
 */

import { z } from 'zod';

import {
  paginationQuerySchema,
  paginationMetadataSchema,
  paginatedResponseSchema,
  filterSchema,
  dateSchema,
  dateTimeSchema,
  httpErrorWithInstanceSchema,
} from './common.schema.ts';
import {
  createTaskSchema,
  taskListItemSchema,
  getTasksRequestSchema,
  tasksListResponseSchema,
  taskDetailSchema,
  bulkDeleteTasksSchema,
  bulkDeleteResponseSchema,
  bulkCancelTasksSchema,
  bulkCancelResponseSchema,
  startTasksSchema,
  startTasksResponseSchema,
} from './report-6406/tasks.schema.ts';
import {
  branchSchema,
  currencyReferenceSchema,
  formatReferenceSchema,
  sourceSchema,
  branchesResponseSchema,
  currenciesResponseSchema,
  formatsResponseSchema,
  sourcesResponseSchema,
} from './report-6406/references.schema.ts';
import {
  createPackageSchema,
  updatePackageSchema,
  packageSchema,
  packagesListResponseSchema,
  bulkDeletePackagesSchema,
  bulkDeletePackagesResponseSchema,
  updatePackageResponseSchema,
  addTasksToPackageSchema,
  addTasksToPackageResponseSchema,
  bulkRemoveTasksFromPackageSchema,
  bulkRemoveTasksResponseSchema,
  copyToTfrResponseSchema,
} from './report-6406/packages.schema.ts';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from './report-6406/export.schema.ts';
import {
  taskStatusHistoryItemSchema,
  taskStatusHistoryResponseSchema,
} from './report-6406/task-status-history.schema.ts';
import {
  packageStatusHistoryItemSchema,
  packageStatusHistoryResponseSchema,
} from './report-6406/package-status-history.schema.ts';
import {
  storageVolumeItemSchema,
  storageVolumeListResponseSchema,
} from './report-6406/storage.schema.ts';
import {
  taskFileSchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from './report-6406/task-files.schema.ts';
import { sortOrderSchema } from './enums/SortOrderEnum';
import { currencySchema } from './enums/CurrencyEnum';
import { fileFormatSchema } from './enums/FileFormatEnum';
import { reportTypeSchema } from './enums/ReportTypeEnum.ts';
import { taskStatusSchema } from './enums/TaskStatusEnum.ts';
import { packetStatusSchema } from './enums/PackageStatusEnum.ts';
import { fileStatusZodSchema } from './enums/FileStatusEnum.ts';
import { storageCodeZodSchema } from './enums/StorageCodeEnum.ts';

export const openApiRegistry = z.registry<{ id: string }>();

// Enums
openApiRegistry.add(sortOrderSchema, { id: 'SortOrderEnum' });
openApiRegistry.add(currencySchema, { id: 'CurrencyEnum' });
openApiRegistry.add(fileFormatSchema, { id: 'FileFormatEnum' });
openApiRegistry.add(reportTypeSchema, { id: 'ReportTypeEnum' });
openApiRegistry.add(taskStatusSchema, { id: 'TaskStatusEnum' });
openApiRegistry.add(packetStatusSchema, { id: 'PackageStatusEnum' });
openApiRegistry.add(fileStatusZodSchema, { id: 'FileStatusEnum' });
openApiRegistry.add(storageCodeZodSchema, { id: 'StorageCodeEnum' });

// Общие схемы
openApiRegistry.add(paginationQuerySchema, { id: 'PaginationRequestDto' });
openApiRegistry.add(paginationMetadataSchema, { id: 'PaginationMetadataDto' });
openApiRegistry.add(paginatedResponseSchema, { id: 'PaginatedResponseDto' });
openApiRegistry.add(filterSchema, { id: 'FilterDto' });
openApiRegistry.add(dateSchema, { id: 'DateSchema' });
openApiRegistry.add(dateTimeSchema, { id: 'DateTimeSchema' });
openApiRegistry.add(httpErrorWithInstanceSchema, { id: 'HttpErrorWithInstanceDto' });

// Справочники
openApiRegistry.add(branchSchema, { id: 'BranchDto' });
openApiRegistry.add(currencyReferenceSchema, { id: 'CurrencyDto' });
openApiRegistry.add(formatReferenceSchema, { id: 'FormatDto' });
openApiRegistry.add(sourceSchema, { id: 'SourceDto' });
openApiRegistry.add(branchesResponseSchema, { id: 'BranchesResponseDto' });
openApiRegistry.add(currenciesResponseSchema, { id: 'CurrenciesResponseDto' });
openApiRegistry.add(formatsResponseSchema, { id: 'FormatsResponseDto' });
openApiRegistry.add(sourcesResponseSchema, { id: 'SourcesResponseDto' });

// Задания
openApiRegistry.add(createTaskSchema, { id: 'CreateTaskDto' });
openApiRegistry.add(taskListItemSchema, { id: 'TaskListItemDto' });
openApiRegistry.add(getTasksRequestSchema, { id: 'GetTasksRequestDto' });
openApiRegistry.add(tasksListResponseSchema, { id: 'TasksListResponseDto' });
openApiRegistry.add(taskDetailSchema, { id: 'TaskDetailDto' });
openApiRegistry.add(bulkDeleteTasksSchema, { id: 'BulkDeleteTasksRequestDto' });
openApiRegistry.add(bulkDeleteResponseSchema, { id: 'BulkDeleteTasksResponseDto' });
openApiRegistry.add(bulkCancelTasksSchema, { id: 'BulkCancelTasksRequestDto' });
openApiRegistry.add(bulkCancelResponseSchema, { id: 'BulkCancelTasksResponseDto' });
openApiRegistry.add(startTasksSchema, { id: 'StartTasksRequestDto' });
openApiRegistry.add(startTasksResponseSchema, { id: 'StartTasksResponseDto' });
openApiRegistry.add(taskStatusHistoryItemSchema, { id: 'TaskStatusHistoryItemDto' });
openApiRegistry.add(taskStatusHistoryResponseSchema, { id: 'TaskStatusHistoryResponseDto' });
openApiRegistry.add(taskFileSchema, { id: 'TaskFileDto' });
openApiRegistry.add(taskFilesResponseSchema, { id: 'TaskFilesResponseDto' });
openApiRegistry.add(retryFileConversionResponseSchema, { id: 'RetryFileConversionResponseDto' });

// Пакеты
openApiRegistry.add(createPackageSchema, { id: 'CreatePackageDto' });
openApiRegistry.add(updatePackageSchema, { id: 'UpdatePackageDto' });
openApiRegistry.add(packageSchema, { id: 'PackageDto' });
openApiRegistry.add(packagesListResponseSchema, { id: 'PackagesListResponseDto' });
openApiRegistry.add(bulkDeletePackagesSchema, { id: 'BulkDeletePackagesRequestDto' });
openApiRegistry.add(bulkDeletePackagesResponseSchema, { id: 'BulkDeletePackagesResponseDto' });
openApiRegistry.add(updatePackageResponseSchema, { id: 'UpdatePackageResponseDto' });
openApiRegistry.add(addTasksToPackageSchema, { id: 'AddTasksToPackageRequestDto' });
openApiRegistry.add(addTasksToPackageResponseSchema, { id: 'AddTasksToPackageResponseDto' });
openApiRegistry.add(bulkRemoveTasksFromPackageSchema, { id: 'BulkRemoveTasksFromPackageRequestDto' });
openApiRegistry.add(bulkRemoveTasksResponseSchema, { id: 'BulkRemoveTasksResponseDto' });
openApiRegistry.add(copyToTfrResponseSchema, { id: 'CopyToTfrResponseDto' });
openApiRegistry.add(packageStatusHistoryItemSchema, { id: 'PackageStatusHistoryItemDto' });
openApiRegistry.add(packageStatusHistoryResponseSchema, { id: 'PackageStatusHistoryResponseDto' });

// Экспорт
openApiRegistry.add(exportTasksRequestSchema, { id: 'ExportTasksRequestDto' });
openApiRegistry.add(exportTasksResponseSchema, { id: 'ExportTasksResponseDto' });

// Storage
openApiRegistry.add(storageVolumeItemSchema, { id: 'StorageVolumeItemDto' });
openApiRegistry.add(storageVolumeListResponseSchema, { id: 'StorageVolumeListResponseDto' });
