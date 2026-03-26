import { z } from 'zod';

import { sortOrderSchema } from './SortOrderEnum.ts';
import { currencySchema } from './CurrencyEnum.ts';
import { fileFormatSchema } from './FileFormatEnum.ts';
import { reportTypeSchema } from './ReportTypeEnum.ts';
import { taskStatusSchema } from './TaskStatusEnum.ts';
import { packetStatusSchema } from './PackageStatusEnum.ts';
import { fileStatusZodSchema } from './FileStatusEnum.ts';
import { storageCodeZodSchema } from './StorageCodeEnum.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация Zod-схем подсистемы report-6406 в общем OpenAPI-реестре.
 */
export function registerEnumsOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(sortOrderSchema, { id: 'SortOrderEnum' });
  registry.add(currencySchema, { id: 'CurrencyEnum' });
  registry.add(fileFormatSchema, { id: 'FileFormatEnum' });
  registry.add(reportTypeSchema, { id: 'ReportTypeEnum' });
  registry.add(taskStatusSchema, { id: 'TaskStatusEnum' });
  registry.add(packetStatusSchema, { id: 'PackageStatusEnum' });
  registry.add(fileStatusZodSchema, { id: 'FileStatusEnum' });
  registry.add(storageCodeZodSchema, { id: 'StorageCodeEnum' });
}
