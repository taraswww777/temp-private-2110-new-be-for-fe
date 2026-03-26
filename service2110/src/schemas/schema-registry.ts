/**
 * Реестр Zod-схем для автоматической генерации $ref в OpenAPI.
 *
 * Используется fastify-type-provider-zod: зарегистрированные здесь схемы
 * автоматически попадают в components.schemas и заменяются на $ref-ссылки
 * в описаниях роутов.
 *
 * Регистрация по доменам: report-6406 и inventorization — отдельные модули.
 */

import { z } from 'zod';

import {
  paginationQuerySchema,
  paginationMetadataSchema,
  paginatedResponseSchema,
} from './common.schema.ts';
import { sortOrderSchema } from './enums/SortOrderEnum';
import { currencySchema } from './enums/CurrencyEnum';
import { fileFormatSchema } from './enums/FileFormatEnum';
import { reportTypeSchema } from './enums/ReportTypeEnum.ts';
import { taskStatusSchema } from './enums/TaskStatusEnum.ts';
import { packetStatusSchema } from './enums/PackageStatusEnum.ts';
import { fileStatusZodSchema } from './enums/FileStatusEnum.ts';
import { storageCodeZodSchema } from './enums/StorageCodeEnum.ts';
import { registerReport6406OpenApiSchemas } from './report-6406/openapi-register.ts';
import { registerInventorizationOpenApiSchemas } from './inventorization/openapi-register.ts';
import { dateSchema, dateTimeSchema } from './common/dateString.schema.ts';

export const openApiRegistry = z.registry<{ id: string }>();

// Enums
openApiRegistry.add(sortOrderSchema, { id: 'SortOrderEnum' });
openApiRegistry.add(currencySchema, { id: 'CurrencyEnum' });
openApiRegistry.add(fileFormatSchema, { id: 'FileFormatEnum' });
openApiRegistry.add(reportTypeSchema, { id: 'ReportTypeEnum' });
openApiRegistry.add(taskStatusSchema, { id: 'TaskStatusEnum' });
openApiRegistry.add(packetStatusSchema, { id: 'PackageStatusEnum' });
openApiRegistry.add(fileStatusZodSchema, { id: 'FileStatusEnum' });
openApiRegistry.add(storageCodeZodSchema, { id: 'StorageCodeEnum' });

// Общие схемы
openApiRegistry.add(paginationQuerySchema, { id: 'PaginationRequestDto' });
openApiRegistry.add(paginationMetadataSchema, { id: 'PaginationMetadataDto' });
openApiRegistry.add(paginatedResponseSchema, { id: 'PaginatedResponseDto' });
openApiRegistry.add(dateSchema, { id: 'DateSchema' });
openApiRegistry.add(dateTimeSchema, { id: 'DateTimeSchema' });

registerReport6406OpenApiSchemas(openApiRegistry);
registerInventorizationOpenApiSchemas(openApiRegistry);

export type { OpenApiSchemaRegistry } from './report-6406/openapi-register.ts';
