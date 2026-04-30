import { z } from 'zod';

import { paginatedResponseSchema, paginationMetadataSchema, paginationQuerySchema } from './pagination.schema.ts';
import { dateSchema, dateTimeSchema } from './dateString.schema.ts';
import { sortOrderSchema } from './SortOrderEnum.ts';
import { zErrorDTOSchema } from './errorDTO.schema.ts';
import { processRequestSchema, processResponseSchema, processResultItemSchema } from './process.schema.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация общих Zod-схем (пагинация, даты, сортировка) в OpenAPI-реестре.
 */
export function registerCommonOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(paginationQuerySchema, { id: 'PaginationRequestDto' });
  registry.add(paginationMetadataSchema, { id: 'PaginationMetadataDto' });
  registry.add(paginatedResponseSchema, { id: 'PaginatedResponseDto' });
  registry.add(dateSchema, { id: 'DateSchema' });
  registry.add(zErrorDTOSchema, { id: 'ErrorDTO' });
  registry.add(dateTimeSchema, { id: 'DateTimeSchema' });
  registry.add(sortOrderSchema, { id: 'SortOrderEnum' });
  registry.add(processRequestSchema, { id: 'ProcessDto' });
  registry.add(processResponseSchema, { id: 'ProcessResponseDto' });
  registry.add(processResultItemSchema, { id: 'ProcessResultItemDto' });
}
