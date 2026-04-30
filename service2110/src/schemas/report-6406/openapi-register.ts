import { z } from 'zod';

import { registerReport6406EnumsOpenApiSchemas } from './enums/openapi-register.ts';
import {
  createTaskSchema,
  getTasksRequestSchema,
  taskDetailSchema,
  taskListItemSchema,
  tasksListResponseSchema,
} from './tasks.schema.ts';
import {
  branchesResponseSchema,
  branchSchema,
  currenciesResponseSchema,
  currencyReferenceSchema,
  formatReferenceSchema,
  formatsResponseSchema,
  sourceSchema,
  sourcesResponseSchema,
} from './references.schema.ts';
import {
  addTasksToPackageSchema,
  copyToTfrResponseSchema,
  createPackageSchema,
  getPackageListResponseSchema,
  packageSchema,
  packageTfrResponseSchema,
  updatePackageResponseSchema,
  updatePackageSchema,
} from './packages.schema.ts';
import { exportTasksResponseSchema } from './export.schema.ts';
import { taskStatusHistoryItemSchema, taskStatusHistoryResponseSchema } from './task-status-history.schema.ts';
import {
  packageStatusHistoryItemSchema,
  packageStatusHistoryResponseSchema,
} from './package-status-history.schema.ts';
import { storageVolumeItemSchema, storageVolumeListResponseSchema } from './storage.schema.ts';
import {
  retryFileConversionResponseSchema,
  taskFileSchema,
  taskFilesResponseSchema,
  taskFileUrlItemSchema,
  taskFileUrlResponseSchema,
} from './task-files.schema.ts';
import { accountMaskItemSchema, accountMasksResponseSchema } from './dictionary.schema.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация Zod-схем подсистемы report-6406 в общем OpenAPI-реестре.
 */
export function registerReport6406OpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registerReport6406EnumsOpenApiSchemas(registry);

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
  registry.add(taskStatusHistoryItemSchema, { id: 'TaskStatusHistoryItemDto' });
  registry.add(taskStatusHistoryResponseSchema, { id: 'TaskStatusHistoryResponseDto' });
  registry.add(taskFileSchema, { id: 'TaskFileDto' });
  registry.add(taskFilesResponseSchema, { id: 'TaskFilesResponseDto' });
  registry.add(taskFileUrlItemSchema, { id: 'TaskFileUrlItemDto' });
  registry.add(taskFileUrlResponseSchema, { id: 'TaskFileUrlResponseDto' });
  registry.add(retryFileConversionResponseSchema, { id: 'RetryFileConversionResponseDto' });

  registry.add(createPackageSchema, { id: 'CreatePackageDto' });
  registry.add(updatePackageSchema, { id: 'UpdatePackageDto' });
  registry.add(packageSchema, { id: 'PackageDto' });
  registry.add(getPackageListResponseSchema, { id: 'PackagesListResponseDto' });
  registry.add(updatePackageResponseSchema, { id: 'UpdatePackageResponseDto' });
  registry.add(addTasksToPackageSchema, { id: 'AddTasksToPackageRequestDto' });
  registry.add(copyToTfrResponseSchema, { id: 'CopyToTfrResponseDto' });
  registry.add(packageStatusHistoryItemSchema, { id: 'PackageStatusHistoryItemDto' });
  registry.add(packageStatusHistoryResponseSchema, { id: 'PackageStatusHistoryResponseDto' });

  registry.add(exportTasksResponseSchema, { id: 'ExportTasksResponseDto' });

  registry.add(storageVolumeItemSchema, { id: 'StorageVolumeItemDto' });
  registry.add(storageVolumeListResponseSchema, { id: 'StorageVolumeListResponseDto' });

  registry.add(accountMaskItemSchema, { id: 'AccountMaskItemDto' });
  registry.add(accountMasksResponseSchema, { id: 'AccountMasksResponseDto' });

  registry.add(packageTfrResponseSchema, { id: 'PackageTfrResponseDto' });
}
