import { paginatedResponseSchema, paginationMetadataSchema, paginationQuerySchema } from './pagination.schema.ts';
import { dateSchema, dateTimeSchema } from './dateString.schema.ts';
import { sortOrderSchema } from './SortOrderEnum.ts';
import { zErrorDTOSchema } from './errorDTO.schema.ts';
import { processRequestSchema, processResponseSchema, processResultItemSchema } from './process.schema.ts';
import { zIdSchema, idParamSchema, idListSchema } from './id.schema.ts';
import { zUuidSchema, uuidParamSchema } from './uuid.schema.ts';
import { zAccountSchema, zAccountSecondOrderSchema } from '../common.schema.ts';

import { registerOpenApiComponent } from '../utils/registerOpenApiComponent.ts';

export type { OpenApiSchemaRegistry } from '../../types/openapi-schema-registry.ts';

/**
 * Регистрация общих Zod-схем (пагинация, даты, сортировка) в OpenAPI-реестре.
 */
export function registerCommonOpenApiSchemas() {
  registerOpenApiComponent(zIdSchema, 'IntegerIdSchema');
  registerOpenApiComponent(idParamSchema, 'IdPathParamDto');
  registerOpenApiComponent(idListSchema, 'IdListSchema');
  registerOpenApiComponent(zUuidSchema, 'UuidSchema');
  registerOpenApiComponent(uuidParamSchema, 'UuidPathParamDto');
  registerOpenApiComponent(zAccountSchema, 'AccountNumberSchema');
  registerOpenApiComponent(zAccountSecondOrderSchema, 'AccountSecondOrderSchema');
  registerOpenApiComponent(paginationQuerySchema, 'PaginationRequestDto');
  registerOpenApiComponent(paginationMetadataSchema, 'PaginationMetadataDto');
  registerOpenApiComponent(paginatedResponseSchema, 'PaginatedResponseDto');
  registerOpenApiComponent(dateSchema, 'DateSchema');
  registerOpenApiComponent(zErrorDTOSchema, 'ErrorDTO');
  registerOpenApiComponent(dateTimeSchema, 'DateTimeSchema');
  registerOpenApiComponent(sortOrderSchema, 'SortOrderEnum');
  registerOpenApiComponent(processRequestSchema, 'ProcessDto');
  registerOpenApiComponent(processResponseSchema, 'ProcessResponseDto');
  registerOpenApiComponent(processResultItemSchema, 'ProcessResultItemDto');
}
