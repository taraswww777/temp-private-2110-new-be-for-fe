/**
 * Регистрация переиспользуемых компонентов для OpenAPI спецификации
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
import { storageVolumeItemSchema, storageVolumeListResponseSchema } from './report-6406/storage.schema.js';
import {
  taskFileSchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from './report-6406/task-files.schema.js';

/**
 * Функция для конвертации Zod схемы в JSON Schema с именем
 */
function zodToJsonSchema(schema: unknown, name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonSchema = (schema as any).toJSONSchema({
      target: 'openApi3' as const,
      $refStrategy: 'none' as const,
      removeIncompatibleMeta: true,
    });
    
    // Добавляем заголовок для идентификации
    return {
      ...jsonSchema,
      title: name,
    };
  } catch (error) {
    console.error(`Error converting schema ${name}:`, error);
    return { type: 'object', title: name };
  }
}

/**
 * Получить все переиспользуемые компоненты для OpenAPI
 */
export function getOpenApiComponents() {
  return {
    // Общие схемы
    PaginationRequestDto: zodToJsonSchema(paginationQuerySchema, 'PaginationRequestDto'),
    PaginationMetadataDto: zodToJsonSchema(paginationMetadataSchema, 'PaginationMetadataDto'),
    PaginatedResponseDto: zodToJsonSchema(paginatedResponseSchema, 'PaginatedResponseDto'),
    SortingRequestDto: zodToJsonSchema(sortingRequestSchema, 'SortingRequestDto'),
    FilterDto: zodToJsonSchema(filterSchema, 'FilterDto'),
    DateSchema: zodToJsonSchema(dateSchema, 'DateSchema'),
    DateTimeSchema: zodToJsonSchema(dateTimeSchema, 'DateTimeSchema'),
    FileFormatEnumSchema: zodToJsonSchema(fileFormatSchema, 'FileFormatEnumSchema'),
    ReportTypeEnumSchema: zodToJsonSchema(reportTypeSchema, 'ReportTypeEnumSchema'),
    ReportTaskStatusEnumSchema: zodToJsonSchema(reportTaskStatusSchema, 'ReportTaskStatusEnumSchema'),
    CurrencyEnumSchema: zodToJsonSchema(currencySchema, 'CurrencyEnumSchema'),
    SortOrderEnumSchema: zodToJsonSchema(sortOrderSchema, 'SortOrderEnumSchema'),
    HealthResponseDto: zodToJsonSchema(healthResponseSchema, 'HealthResponseDto'),
    HttpErrorWithInstanceDto: zodToJsonSchema(httpErrorWithInstanceSchema, 'HttpErrorWithInstanceDto'),
    
    // Справочники
    BranchDto: zodToJsonSchema(branchSchema, 'BranchDto'),
    ReportTypeDto: zodToJsonSchema(reportTypeReferenceSchema, 'ReportTypeDto'),
    CurrencyDto: zodToJsonSchema(currencyReferenceSchema, 'CurrencyDto'),
    FormatDto: zodToJsonSchema(formatReferenceSchema, 'FormatDto'),
    SourceDto: zodToJsonSchema(sourceSchema, 'SourceDto'),
    BranchesResponseDto: zodToJsonSchema(branchesResponseSchema, 'BranchesResponseDto'),
    ReportTypesResponseDto: zodToJsonSchema(reportTypesResponseSchema, 'ReportTypesResponseDto'),
    CurrenciesResponseDto: zodToJsonSchema(currenciesResponseSchema, 'CurrenciesResponseDto'),
    FormatsResponseDto: zodToJsonSchema(formatsResponseSchema, 'FormatsResponseDto'),
    SourcesResponseDto: zodToJsonSchema(sourcesResponseSchema, 'SourcesResponseDto'),
    
    // Задания
    CreateTaskDto: zodToJsonSchema(createTaskSchema, 'CreateTaskDto'),
    TaskDto: zodToJsonSchema(taskSchema, 'TaskDto'),
    TaskListItemDto: zodToJsonSchema(taskListItemSchema, 'TaskListItemDto'),
    GetTasksRequestDto: zodToJsonSchema(getTasksRequestSchema, 'GetTasksRequestDto'),
    TasksListResponseDto: zodToJsonSchema(tasksListResponseSchema, 'TasksListResponseDto'),
    TaskDetailDto: zodToJsonSchema(taskDetailSchema, 'TaskDetailDto'),
    TaskDetailsDto: zodToJsonSchema(taskDetailsSchema, 'TaskDetailsDto'),
    BulkDeleteTasksResponseDto: zodToJsonSchema(bulkDeleteResponseSchema, 'BulkDeleteTasksResponseDto'),
    BulkCancelTasksResponseDto: zodToJsonSchema(bulkCancelResponseSchema, 'BulkCancelTasksResponseDto'),
    StartTasksResponseDto: zodToJsonSchema(startTasksResponseSchema, 'StartTasksResponseDto'),
    StatusHistoryItemDto: zodToJsonSchema(statusHistoryItemSchema, 'StatusHistoryItemDto'),
    StatusHistoryResponseDto: zodToJsonSchema(statusHistoryResponseSchema, 'StatusHistoryResponseDto'),
    TaskFileDto: zodToJsonSchema(taskFileSchema, 'TaskFileDto'),
    TaskFilesResponseDto: zodToJsonSchema(taskFilesResponseSchema, 'TaskFilesResponseDto'),
    RetryFileConversionResponseDto: zodToJsonSchema(retryFileConversionResponseSchema, 'RetryFileConversionResponseDto'),
    
    // Пакеты
    CreatePackageDto: zodToJsonSchema(createPackageSchema, 'CreatePackageDto'),
    UpdatePackageDto: zodToJsonSchema(updatePackageSchema, 'UpdatePackageDto'),
    PackageDto: zodToJsonSchema(packageSchema, 'PackageDto'),
    PackageDetailDto: zodToJsonSchema(packageDetailSchema, 'PackageDetailDto'),
    PackagesListResponseDto: zodToJsonSchema(packagesListResponseSchema, 'PackagesListResponseDto'),
    BulkDeletePackagesResponseDto: zodToJsonSchema(bulkDeletePackagesResponseSchema, 'BulkDeletePackagesResponseDto'),
    UpdatePackageResponseDto: zodToJsonSchema(updatePackageResponseSchema, 'UpdatePackageResponseDto'),
    AddTasksToPackageResponseDto: zodToJsonSchema(addTasksToPackageResponseSchema, 'AddTasksToPackageResponseDto'),
    BulkRemoveTasksResponseDto: zodToJsonSchema(bulkRemoveTasksResponseSchema, 'BulkRemoveTasksResponseDto'),
    CopyToTfrResponseDto: zodToJsonSchema(copyToTfrResponseSchema, 'CopyToTfrResponseDto'),
    
    // Экспорт
    ExportTasksRequestDto: zodToJsonSchema(exportTasksRequestSchema, 'ExportTasksRequestDto'),
    ExportTasksResponseDto: zodToJsonSchema(exportTasksResponseSchema, 'ExportTasksResponseDto'),
    
    // Storage
    StorageVolumeItemDto: zodToJsonSchema(storageVolumeItemSchema, 'StorageVolumeItemDto'),
    StorageVolumeListResponseDto: zodToJsonSchema(storageVolumeListResponseSchema, 'StorageVolumeListResponseDto'),
  };
}
