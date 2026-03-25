import { z } from 'zod';

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
} from './tasks.schema.ts';
import {
  branchSchema,
  currencyReferenceSchema,
  formatReferenceSchema,
  sourceSchema,
  branchesResponseSchema,
  currenciesResponseSchema,
  formatsResponseSchema,
  sourcesResponseSchema,
} from './references.schema.ts';
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
} from './packages.schema.ts';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from './export.schema.ts';
import {
  taskStatusHistoryItemSchema,
  taskStatusHistoryResponseSchema,
} from './task-status-history.schema.ts';
import {
  packageStatusHistoryItemSchema,
  packageStatusHistoryResponseSchema,
} from './package-status-history.schema.ts';
import {
  storageVolumeItemSchema,
  storageVolumeListResponseSchema,
} from './storage.schema.ts';
import {
  taskFileSchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from './task-files.schema.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация Zod-схем подсистемы report-6406 в общем OpenAPI-реестре.
 */
export function registerReport6406OpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(branchSchema, { id: 'BranchDto' });
  registry.add(currencyReferenceSchema, { id: 'CurrencyDto' });
  registry.add(formatReferenceSchema, { id: 'FormatDto' });
  registry.add(sourceSchema, { id: 'SourceDto' });
  registry.add(branchesResponseSchema, { id: 'BranchesResponseDto' });
  registry.add(currenciesResponseSchema, { id: 'CurrenciesResponseDto' });
  registry.add(formatsResponseSchema, { id: 'FormatsResponseDto' });
  registry.add(sourcesResponseSchema, { id: 'SourcesResponseDto' });

  registry.add(createTaskSchema, { id: 'CreateTaskDto' });
  registry.add(taskListItemSchema, { id: 'TaskListItemDto' });
  registry.add(getTasksRequestSchema, { id: 'GetTasksRequestDto' });
  registry.add(tasksListResponseSchema, { id: 'TasksListResponseDto' });
  registry.add(taskDetailSchema, { id: 'TaskDetailDto' });
  registry.add(bulkDeleteTasksSchema, { id: 'BulkDeleteTasksRequestDto' });
  registry.add(bulkDeleteResponseSchema, { id: 'BulkDeleteTasksResponseDto' });
  registry.add(bulkCancelTasksSchema, { id: 'BulkCancelTasksRequestDto' });
  registry.add(bulkCancelResponseSchema, { id: 'BulkCancelTasksResponseDto' });
  registry.add(startTasksSchema, { id: 'StartTasksRequestDto' });
  registry.add(startTasksResponseSchema, { id: 'StartTasksResponseDto' });
  registry.add(taskStatusHistoryItemSchema, { id: 'TaskStatusHistoryItemDto' });
  registry.add(taskStatusHistoryResponseSchema, { id: 'TaskStatusHistoryResponseDto' });
  registry.add(taskFileSchema, { id: 'TaskFileDto' });
  registry.add(taskFilesResponseSchema, { id: 'TaskFilesResponseDto' });
  registry.add(retryFileConversionResponseSchema, { id: 'RetryFileConversionResponseDto' });

  registry.add(createPackageSchema, { id: 'CreatePackageDto' });
  registry.add(updatePackageSchema, { id: 'UpdatePackageDto' });
  registry.add(packageSchema, { id: 'PackageDto' });
  registry.add(packagesListResponseSchema, { id: 'PackagesListResponseDto' });
  registry.add(bulkDeletePackagesSchema, { id: 'BulkDeletePackagesRequestDto' });
  registry.add(bulkDeletePackagesResponseSchema, { id: 'BulkDeletePackagesResponseDto' });
  registry.add(updatePackageResponseSchema, { id: 'UpdatePackageResponseDto' });
  registry.add(addTasksToPackageSchema, { id: 'AddTasksToPackageRequestDto' });
  registry.add(addTasksToPackageResponseSchema, { id: 'AddTasksToPackageResponseDto' });
  registry.add(bulkRemoveTasksFromPackageSchema, { id: 'BulkRemoveTasksFromPackageRequestDto' });
  registry.add(bulkRemoveTasksResponseSchema, { id: 'BulkRemoveTasksResponseDto' });
  registry.add(copyToTfrResponseSchema, { id: 'CopyToTfrResponseDto' });
  registry.add(packageStatusHistoryItemSchema, { id: 'PackageStatusHistoryItemDto' });
  registry.add(packageStatusHistoryResponseSchema, { id: 'PackageStatusHistoryResponseDto' });

  registry.add(exportTasksRequestSchema, { id: 'ExportTasksRequestDto' });
  registry.add(exportTasksResponseSchema, { id: 'ExportTasksResponseDto' });

  registry.add(storageVolumeItemSchema, { id: 'StorageVolumeItemDto' });
  registry.add(storageVolumeListResponseSchema, { id: 'StorageVolumeListResponseDto' });
}
