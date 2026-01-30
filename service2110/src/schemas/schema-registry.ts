/**
 * Реестр Zod схем для создания ссылок в OpenAPI
 */

import { 
  paginationQuerySchema, 
  paginationResponseSchema, 
  filterSchema,
  dateSchema,
  dateTimeSchema,
  sortOrderSchema,
} from './common.schema.js';
import {
  createTaskSchema,
  taskSchema,
  taskListItemSchema,
  tasksListResponseSchema,
  taskDetailSchema,
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
} from './report-6406/references.schema.js';
import {
  createPackageSchema,
  updatePackageSchema,
  packageSchema,
  packageDetailSchema,
  packagesListResponseSchema,
  bulkDeletePackagesResponseSchema,
} from './report-6406/packages.schema.js';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from './report-6406/export.schema.js';

/**
 * Маппинг имён схем на Zod схемы
 */
export const schemaRegistry = new Map<string, unknown>([
  // Общие схемы
  ['PaginationRequestDto', paginationQuerySchema],
  ['PaginationResponseDto', paginationResponseSchema],
  ['FilterDto', filterSchema],
  ['DateSchema', dateSchema],
  ['DateTimeSchema', dateTimeSchema],
  ['FileFormatEnumSchema', fileFormatSchema],
  ['ReportTypeEnumSchema', reportTypeSchema],
  ['ReportTaskStatusEnumSchema', reportTaskStatusSchema],
  ['CurrencyEnumSchema', currencySchema],
  ['SortOrderEnumSchema', sortOrderSchema],
  
  // Справочники
  ['BranchDto', branchSchema],
  ['ReportTypeDto', reportTypeReferenceSchema],
  ['CurrencyDto', currencyReferenceSchema],
  ['FormatDto', formatReferenceSchema],
  ['SourceDto', sourceSchema],
  
  // Задания
  ['CreateTaskDto', createTaskSchema],
  ['TaskDto', taskSchema],
  ['TaskListItemDto', taskListItemSchema],
  ['TasksListResponseDto', tasksListResponseSchema],
  ['TaskDetailDto', taskDetailSchema],
  ['BulkDeleteTasksResponseDto', bulkDeleteResponseSchema],
  ['BulkCancelTasksResponseDto', bulkCancelResponseSchema],
  ['StartTasksResponseDto', startTasksResponseSchema],
  
  // Пакеты
  ['CreatePackageDto', createPackageSchema],
  ['UpdatePackageDto', updatePackageSchema],
  ['PackageDto', packageSchema],
  ['PackageDetailDto', packageDetailSchema],
  ['PackagesListResponseDto', packagesListResponseSchema],
  ['BulkDeletePackagesResponseDto', bulkDeletePackagesResponseSchema],
  
  // Экспорт
  ['ExportTasksRequestDto', exportTasksRequestSchema],
  ['ExportTasksResponseDto', exportTasksResponseSchema],
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
