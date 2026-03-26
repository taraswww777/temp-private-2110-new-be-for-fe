import { z } from 'zod';

import { currencySchema } from './CurrencyEnum.ts';
import { fileFormatSchema } from './FileFormatEnum.ts';
import { fileStatusZodSchema } from './FileStatusEnum.ts';
import { packetStatusSchema } from './PackageStatusEnum.ts';
import { reportTypeSchema } from './ReportTypeEnum.ts';
import { taskStatusSchema } from './TaskStatusEnum.ts';
import { storageCodeZodSchema } from './StorageCodeEnum.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация Zod-схем перечислений report-6406 в общем OpenAPI-реестре.
 */
export function registerReport6406EnumsOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(currencySchema, { id: 'CurrencyEnum' });
  registry.add(fileFormatSchema, { id: 'FileFormatEnum' });
  registry.add(reportTypeSchema, { id: 'ReportTypeEnum' });
  registry.add(taskStatusSchema, { id: 'TaskStatusEnum' });
  registry.add(packetStatusSchema, { id: 'PackageStatusEnum' });
  registry.add(fileStatusZodSchema, { id: 'FileStatusEnum' });
  registry.add(storageCodeZodSchema, { id: 'StorageCodeEnum' });
}
