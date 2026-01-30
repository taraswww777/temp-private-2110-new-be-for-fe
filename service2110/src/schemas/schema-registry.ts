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
  sortOrderSchema,
  healthResponseSchema,
  httpErrorWithInstanceSchema,
} from './common.schema.js';
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
  fileFormatSchema,
  reportTypeSchema,
  reportTaskStatusSchema,
  currencySchema,
} from './report-6406/tasks.schema.js';
import {
  branchSchema,
  reportTypeReferenceSchema,
  currencyReferenceSchema,
  formatReferenceSchema,
  sourceSchema,
  branchesResponseSchema,
  reportTypesResponseSchema,
  currenciesResponseSchema,
  formatsResponseSchema,
  sourcesResponseSchema,
} from './report-6406/references.schema.js';
import {
  createPackageSchema,
  updatePackageSchema,
  packageSchema,
  packageDetailSchema,
  packagesListResponseSchema,
  bulkDeletePackagesResponseSchema,
  updatePackageResponseSchema,
  addTasksToPackageResponseSchema,
  bulkRemoveTasksResponseSchema,
  copyToTfrResponseSchema,
} from './report-6406/packages.schema.js';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from './report-6406/export.schema.js';
import {
  statusHistoryItemSchema,
  statusHistoryResponseSchema,
} from './report-6406/task-status-history.schema.js';
import { storageVolumeResponseSchema } from './report-6406/storage.schema.js';
import {
  taskFileSchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from './report-6406/task-files.schema.js';

/**
 * Маппинг имён схем на Zod схемы
 */
export const schemaRegistry = new Map<string, unknown>([
  // Общие схемы
  ['PaginationRequestDto', paginationQuerySchema],
  ['PaginationMetadataDto', paginationMetadataSchema],
  ['PaginatedResponseDto', paginatedResponseSchema],
  ['SortingRequestDto', sortingRequestSchema],
  ['FilterDto', filterSchema],
  ['DateSchema', dateSchema],
  ['DateTimeSchema', dateTimeSchema],
  ['FileFormatEnumSchema', fileFormatSchema],
  ['ReportTypeEnumSchema', reportTypeSchema],
  ['ReportTaskStatusEnumSchema', reportTaskStatusSchema],
  ['CurrencyEnumSchema', currencySchema],
  ['SortOrderEnumSchema', sortOrderSchema],
  ['HealthResponseDto', healthResponseSchema],
  ['HttpErrorWithInstanceDto', httpErrorWithInstanceSchema],
  
  // Справочники
  ['BranchDto', branchSchema],
  ['ReportTypeDto', reportTypeReferenceSchema],
  ['CurrencyDto', currencyReferenceSchema],
  ['FormatDto', formatReferenceSchema],
  ['SourceDto', sourceSchema],
  ['BranchesResponseDto', branchesResponseSchema],
  ['ReportTypesResponseDto', reportTypesResponseSchema],
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
  ['PackageDetailDto', packageDetailSchema],
  ['PackagesListResponseDto', packagesListResponseSchema],
  ['BulkDeletePackagesResponseDto', bulkDeletePackagesResponseSchema],
  ['UpdatePackageResponseDto', updatePackageResponseSchema],
  ['AddTasksToPackageResponseDto', addTasksToPackageResponseSchema],
  ['BulkRemoveTasksResponseDto', bulkRemoveTasksResponseSchema],
  ['CopyToTfrResponseDto', copyToTfrResponseSchema],
  
  // Экспорт
  ['ExportTasksRequestDto', exportTasksRequestSchema],
  ['ExportTasksResponseDto', exportTasksResponseSchema],
  
  // Storage
  ['StorageVolumeDto', storageVolumeResponseSchema],
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
