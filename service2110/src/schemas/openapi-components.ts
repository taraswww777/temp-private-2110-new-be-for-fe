/**
 * Регистрация переиспользуемых компонентов для OpenAPI спецификации
 */

import {
  dateSchema,
  dateTimeSchema,
  filterSchema,
  healthResponseSchema,
  httpErrorWithInstanceSchema,
  paginatedResponseSchema,
  paginationMetadataSchema,
  paginationQuerySchema,
  sortingRequestSchema,
} from './common.schema.ts';
import {
  bulkCancelResponseSchema,
  bulkDeleteResponseSchema,
  createTaskSchema,
  getTasksRequestSchema,
  reportTaskStatusSchema,
  startTasksResponseSchema,
  taskDetailSchema,
  taskDetailsSchema,
  taskListItemSchema,
  taskSchema,
  tasksListResponseSchema,
} from './report-6406/tasks.schema.ts';
import {
  branchesResponseSchema,
  branchSchema,
  currenciesResponseSchema,
  currencyReferenceSchema,
  formatReferenceSchema,
  formatsResponseSchema,
  sourceSchema,
  sourcesResponseSchema,
} from './report-6406/references.schema.ts';
import {
  addTasksToPackageResponseSchema,
  bulkDeletePackagesResponseSchema,
  bulkRemoveTasksResponseSchema,
  copyToTfrResponseSchema,
  createPackageSchema,
  packageSchema,
  packagesListResponseSchema,
  updatePackageResponseSchema,
  updatePackageSchema,
} from './report-6406/packages.schema.ts';
import { PacketStatusEnumSchema } from './enums/PacketStatusEnum';
import { exportTasksRequestSchema, exportTasksResponseSchema, } from './report-6406/export.schema.ts';
import { statusHistoryItemSchema, statusHistoryResponseSchema, } from './report-6406/task-status-history.schema.ts';
import { packageStatusHistoryItemSchema, packageStatusHistoryResponseSchema } from './report-6406/package-status-history.schema.ts';
import {
  storageCodeSchema,
  storageVolumeItemSchema,
  storageVolumeListResponseSchema
} from './report-6406/storage.schema.ts';
import {
  retryFileConversionResponseSchema,
  taskFileSchema,
  taskFilesResponseSchema,
} from './report-6406/task-files.schema.ts';
import { zodToJsonSchema } from './utils/zodToJsonSchema';
import { ReportFormTypeEnumSchema } from './enums/ReportFormTypeEnum';
import { SortOrderEnumSchema, sortOrderSchema } from './enums/SortOrderEnum';
import { CurrencyEnumSchema, currencySchema } from './enums/CurrencyEnum';
import { FileFormatEnumSchema, fileFormatSchema } from './enums/FileFormatEnum';
import { ReportTypeEnumSchema } from './enums/ReportTypeEnum.ts';

/**
 * Получить все переиспользуемые компоненты для OpenAPI
 */
export function getOpenApiComponents() {
  return {
    // Enums
    PacketStatusEnum: PacketStatusEnumSchema,
    ReportTypeEnum: ReportTypeEnumSchema,
    ReportFormTypeEnum: ReportFormTypeEnumSchema,
    SortOrderEnum: SortOrderEnumSchema,
    CurrencyEnum: CurrencyEnumSchema,
    FileFormatEnum: FileFormatEnumSchema,

    // Общие схемы
    PaginationRequestDto: zodToJsonSchema(paginationQuerySchema, 'PaginationRequestDto'),
    PaginationMetadataDto: zodToJsonSchema(paginationMetadataSchema, 'PaginationMetadataDto'),
    PaginatedResponseDto: zodToJsonSchema(paginatedResponseSchema, 'PaginatedResponseDto'),
    SortingRequestDto: zodToJsonSchema(sortingRequestSchema, 'SortingRequestDto'),
    FilterDto: zodToJsonSchema(filterSchema, 'FilterDto'),
    DateSchema: zodToJsonSchema(dateSchema, 'DateSchema'),
    DateTimeSchema: zodToJsonSchema(dateTimeSchema, 'DateTimeSchema'),
    FileFormatEnumSchema: zodToJsonSchema(fileFormatSchema, 'FileFormatEnumSchema'),
    ReportTaskStatusEnumSchema: zodToJsonSchema(reportTaskStatusSchema, 'ReportTaskStatusEnumSchema'),
    CurrencyEnumSchema: zodToJsonSchema(currencySchema, 'CurrencyEnumSchema'),
    SortOrderEnumSchema: zodToJsonSchema(sortOrderSchema, 'SortOrderEnumSchema'),
    StorageCodeEnumSchema: zodToJsonSchema(storageCodeSchema, 'StorageCodeEnumSchema'),
    HealthResponseDto: zodToJsonSchema(healthResponseSchema, 'HealthResponseDto'),
    HttpErrorWithInstanceDto: zodToJsonSchema(httpErrorWithInstanceSchema, 'HttpErrorWithInstanceDto'),

    // Справочники
    BranchDto: zodToJsonSchema(branchSchema, 'BranchDto'),
    CurrencyDto: zodToJsonSchema(currencyReferenceSchema, 'CurrencyDto'),
    FormatDto: zodToJsonSchema(formatReferenceSchema, 'FormatDto'),
    SourceDto: zodToJsonSchema(sourceSchema, 'SourceDto'),
    BranchesResponseDto: zodToJsonSchema(branchesResponseSchema, 'BranchesResponseDto'),
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
    PackagesListResponseDto: zodToJsonSchema(packagesListResponseSchema, 'PackagesListResponseDto'),
    BulkDeletePackagesResponseDto: zodToJsonSchema(bulkDeletePackagesResponseSchema, 'BulkDeletePackagesResponseDto'),
    UpdatePackageResponseDto: zodToJsonSchema(updatePackageResponseSchema, 'UpdatePackageResponseDto'),
    AddTasksToPackageResponseDto: zodToJsonSchema(addTasksToPackageResponseSchema, 'AddTasksToPackageResponseDto'),
    BulkRemoveTasksResponseDto: zodToJsonSchema(bulkRemoveTasksResponseSchema, 'BulkRemoveTasksResponseDto'),
    CopyToTfrResponseDto: zodToJsonSchema(copyToTfrResponseSchema, 'CopyToTfrResponseDto'),
    PackageStatusHistoryItemDto: zodToJsonSchema(packageStatusHistoryItemSchema, 'PackageStatusHistoryItemDto'),
    PackageStatusHistoryResponseDto: zodToJsonSchema(packageStatusHistoryResponseSchema, 'PackageStatusHistoryResponseDto'),

    // Экспорт
    ExportTasksRequestDto: zodToJsonSchema(exportTasksRequestSchema, 'ExportTasksRequestDto'),
    ExportTasksResponseDto: zodToJsonSchema(exportTasksResponseSchema, 'ExportTasksResponseDto'),

    // Storage
    StorageVolumeItemDto: zodToJsonSchema(storageVolumeItemSchema, 'StorageVolumeItemDto'),
    StorageVolumeListResponseDto: zodToJsonSchema(storageVolumeListResponseSchema, 'StorageVolumeListResponseDto'),
  };
}
