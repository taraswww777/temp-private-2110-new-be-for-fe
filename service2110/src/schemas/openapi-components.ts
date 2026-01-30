/**
 * Регистрация переиспользуемых компонентов для OpenAPI спецификации
 */

import { 
  paginationQuerySchema, 
  paginationResponseSchema, 
  filterSchema 
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
    PaginationResponseDto: zodToJsonSchema(paginationResponseSchema, 'PaginationResponseDto'),
    FilterDto: zodToJsonSchema(filterSchema, 'FilterDto'),
    
    // Справочники
    BranchDto: zodToJsonSchema(branchSchema, 'BranchDto'),
    ReportTypeDto: zodToJsonSchema(reportTypeReferenceSchema, 'ReportTypeDto'),
    CurrencyDto: zodToJsonSchema(currencyReferenceSchema, 'CurrencyDto'),
    FormatDto: zodToJsonSchema(formatReferenceSchema, 'FormatDto'),
    SourceDto: zodToJsonSchema(sourceSchema, 'SourceDto'),
    
    // Задания
    CreateTaskDto: zodToJsonSchema(createTaskSchema, 'CreateTaskDto'),
    TaskDto: zodToJsonSchema(taskSchema, 'TaskDto'),
    TaskListItemDto: zodToJsonSchema(taskListItemSchema, 'TaskListItemDto'),
    TasksListResponseDto: zodToJsonSchema(tasksListResponseSchema, 'TasksListResponseDto'),
    TaskDetailDto: zodToJsonSchema(taskDetailSchema, 'TaskDetailDto'),
    BulkDeleteTasksResponseDto: zodToJsonSchema(bulkDeleteResponseSchema, 'BulkDeleteTasksResponseDto'),
    BulkCancelTasksResponseDto: zodToJsonSchema(bulkCancelResponseSchema, 'BulkCancelTasksResponseDto'),
    StartTasksResponseDto: zodToJsonSchema(startTasksResponseSchema, 'StartTasksResponseDto'),
    
    // Пакеты
    CreatePackageDto: zodToJsonSchema(createPackageSchema, 'CreatePackageDto'),
    UpdatePackageDto: zodToJsonSchema(updatePackageSchema, 'UpdatePackageDto'),
    PackageDto: zodToJsonSchema(packageSchema, 'PackageDto'),
    PackageDetailDto: zodToJsonSchema(packageDetailSchema, 'PackageDetailDto'),
    PackagesListResponseDto: zodToJsonSchema(packagesListResponseSchema, 'PackagesListResponseDto'),
    BulkDeletePackagesResponseDto: zodToJsonSchema(bulkDeletePackagesResponseSchema, 'BulkDeletePackagesResponseDto'),
    
    // Экспорт
    ExportTasksRequestDto: zodToJsonSchema(exportTasksRequestSchema, 'ExportTasksRequestDto'),
    ExportTasksResponseDto: zodToJsonSchema(exportTasksResponseSchema, 'ExportTasksResponseDto'),
  };
}
