import { z } from 'zod';

import { paginatedResponseSchema, paginationMetadataSchema, paginationQuerySchema } from './pagination.schema.ts';
import { dateSchema, dateTimeSchema } from './dateString.schema.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация Zod-схем подсистемы report-6406 в общем OpenAPI-реестре.
 */
export function registerCommonOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(paginationQuerySchema, { id: 'PaginationRequestDto' });
  registry.add(paginationMetadataSchema, { id: 'PaginationMetadataDto' });
  registry.add(paginatedResponseSchema, { id: 'PaginatedResponseDto' });
  registry.add(dateSchema, { id: 'DateSchema' });
  registry.add(dateTimeSchema, { id: 'DateTimeSchema' });
}
