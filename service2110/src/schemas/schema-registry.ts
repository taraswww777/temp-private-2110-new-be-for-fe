/**
 * Реестр Zod схем для создания ссылок в OpenAPI
 */

import {
  paginationQuerySchema,
  paginationMetadataSchema,
  paginatedResponseSchema,
  sortingRequestSchema,
  filterSchema,
  dateSchema,
  dateTimeSchema,
  healthResponseSchema,
  httpErrorWithInstanceSchema,
} from './common.schema.ts';
import {
  createTaskSchema,
  taskSchema,
  taskListItemSchema,
  getTasksRequestSchema,
  tasksListResponseSchema,
  taskDetailSchema,
  taskDetailsSchema,
  bulkDeleteResponseSchema,
  bulkCancelResponseSchema,
  startTasksResponseSchema,
  reportTaskStatusSchema,
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
  bulkDeletePackagesResponseSchema,
  updatePackageResponseSchema,
  addTasksToPackageResponseSchema,
  bulkRemoveTasksResponseSchema,
  copyToTfrResponseSchema,
} from './report-6406/packages.schema.ts';
import { packetStatusSchema } from './enums/PacketStatusEnum';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from './report-6406/export.schema.ts';
import {
  statusHistoryItemSchema,
  statusHistoryResponseSchema,
} from './report-6406/task-status-history.schema.ts';
import {
  packageStatusHistoryItemSchema,
  packageStatusHistoryResponseSchema,
} from './report-6406/package-status-history.schema.ts';
import { storageCodeSchema, storageVolumeItemSchema, storageVolumeListResponseSchema } from './report-6406/storage.schema.ts';
import {
  taskFileSchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from './report-6406/task-files.schema.ts';
import { reportFormTypeSchema } from './enums/ReportFormTypeEnum';
import { SortOrderEnum, sortOrderSchema } from './enums/SortOrderEnum';
import { fileFormatSchema } from './enums/FileFormatEnum';
import { currencySchema } from './enums/CurrencyEnum';

/**
 * Маппинг имён схем на Zod схемы
 */
export const schemaRegistry = new Map<string, unknown>([
  // enums
  ['SortOrderEnum', sortOrderSchema],
  ['ReportFormTypeEnum', reportFormTypeSchema],

  // Общие схемы
  ['PaginationRequestDto', paginationQuerySchema],
  ['PaginationMetadataDto', paginationMetadataSchema],
  ['PaginatedResponseDto', paginatedResponseSchema],
  ['SortingRequestDto', sortingRequestSchema],
  ['FilterDto', filterSchema],
  ['DateSchema', dateSchema],
  ['DateTimeSchema', dateTimeSchema],
  ['FileFormatEnumSchema', fileFormatSchema],
  ['ReportTaskStatusEnumSchema', reportTaskStatusSchema],
  ['CurrencyEnumSchema', currencySchema],
  ['StorageCodeEnumSchema', storageCodeSchema],
  ['HealthResponseDto', healthResponseSchema],
  ['HttpErrorWithInstanceDto', httpErrorWithInstanceSchema],

  // Справочники
  ['BranchDto', branchSchema],
  ['CurrencyDto', currencyReferenceSchema],
  ['FormatDto', formatReferenceSchema],
  ['SourceDto', sourceSchema],
  ['BranchesResponseDto', branchesResponseSchema],
  ['CurrenciesResponseDto', currenciesResponseSchema],
  ['FormatsResponseDto', formatsResponseSchema],
  ['SourcesResponseDto', sourcesResponseSchema],

  // Задания
  ['CreateTaskDto', createTaskSchema],
  ['TaskDto', taskSchema],
  ['TaskListItemDto', taskListItemSchema],
  ['GetTasksRequestDto', getTasksRequestSchema],
  ['TasksListResponseDto', tasksListResponseSchema],
  ['TaskDetailDto', taskDetailSchema],
  ['TaskDetailsDto', taskDetailsSchema],
  ['BulkDeleteTasksResponseDto', bulkDeleteResponseSchema],
  ['BulkCancelTasksResponseDto', bulkCancelResponseSchema],
  ['StartTasksResponseDto', startTasksResponseSchema],
  ['StatusHistoryItemDto', statusHistoryItemSchema],
  ['StatusHistoryResponseDto', statusHistoryResponseSchema],
  ['TaskFileDto', taskFileSchema],
  ['TaskFilesResponseDto', taskFilesResponseSchema],
  ['RetryFileConversionResponseDto', retryFileConversionResponseSchema],

  // Пакеты
  ['CreatePackageDto', createPackageSchema],
  ['UpdatePackageDto', updatePackageSchema],
  ['PackageDto', packageSchema],
  ['PackagesListResponseDto', packagesListResponseSchema],
  ['PacketStatusEnumSchema', packetStatusSchema],
  ['BulkDeletePackagesResponseDto', bulkDeletePackagesResponseSchema],
  ['UpdatePackageResponseDto', updatePackageResponseSchema],
  ['AddTasksToPackageResponseDto', addTasksToPackageResponseSchema],
  ['BulkRemoveTasksResponseDto', bulkRemoveTasksResponseSchema],
  ['CopyToTfrResponseDto', copyToTfrResponseSchema],
  ['PackageStatusHistoryItemDto', packageStatusHistoryItemSchema],
  ['PackageStatusHistoryResponseDto', packageStatusHistoryResponseSchema],

  // Экспорт
  ['ExportTasksRequestDto', exportTasksRequestSchema],
  ['ExportTasksResponseDto', exportTasksResponseSchema],

  // Storage
  ['StorageVolumeItemDto', storageVolumeItemSchema],
  ['StorageVolumeListResponseDto', storageVolumeListResponseSchema],
]);

/**
 * Обратный маппинг - поиск имени по схеме
 */
export function getSchemaName(schema: unknown): string | null {
  for (const [name, registeredSchema] of schemaRegistry.entries()) {
    if (registeredSchema === schema) {
      return name;
    }
  }
  return null;
}

/**
 * Проверка, зарегистрирована ли схема
 */
export function isRegisteredSchema(schema: unknown): boolean {
  return getSchemaName(schema) !== null;
}
