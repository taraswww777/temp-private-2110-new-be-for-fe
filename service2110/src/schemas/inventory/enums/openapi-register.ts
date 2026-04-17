import type { OpenApiSchemaRegistry } from '../../report-6406/openapi-register.ts';

import { inventoryProcessStatusSchema } from './InventoryProcessStatusEnum.ts';
import { inventoryReportStatusSchema } from './InventoryReportStatusEnum.ts';

/**
 * Регистрация Zod-схем перечислений подсистемы инвентаризации в OpenAPI-реестре.
 */
export function registerInventoryEnumsOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(inventoryProcessStatusSchema, { id: 'InventoryProcessStatusEnum' });
  registry.add(inventoryReportStatusSchema, { id: 'InventoryReportStatusEnum' });
}
