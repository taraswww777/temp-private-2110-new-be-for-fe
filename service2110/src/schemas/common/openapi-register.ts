import { z } from 'zod';

import { paginatedResponseSchema, paginationMetadataSchema, paginationQuerySchema } from './pagination.schema.ts';
import { dateSchema, dateTimeSchema } from './dateString.schema.ts';
import { sortOrderSchema } from './SortOrderEnum.ts';

export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;

/**
 * Регистрация общих Zod-схем (пагинация, даты, сортировка) в OpenAPI-реестре.
 */
export function registerCommonOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(paginationQuerySchema, { id: 'PaginationRequestDto' });
  registry.add(paginationMetadataSchema, { id: 'PaginationMetadataDto' });
  registry.add(paginatedResponseSchema, { id: 'PaginatedResponseDto' });
  registry.add(dateSchema, { id: 'DateSchema' });
  registry.add(dateTimeSchema, { id: 'DateTimeSchema' });
  registry.add(sortOrderSchema, { id: 'SortOrderEnum' });
}
