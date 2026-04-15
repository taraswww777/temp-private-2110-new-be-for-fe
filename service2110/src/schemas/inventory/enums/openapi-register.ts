import type { OpenApiSchemaRegistry } from '../../report-6406/openapi-register.ts';

import { inventoryProcessStatusSchema } from './InventoryProcessStatusEnum.ts';
import { inventoryStatisticsStatusSchema } from './InventoryStatisticsStatusEnum.ts';

/**
 * Регистрация Zod-схем перечислений подсистемы инвентаризации в OpenAPI-реестре.
 */
export function registerInventoryEnumsOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(inventoryProcessStatusSchema, { id: 'InventoryProcessStatusEnum' });
  registry.add(inventoryStatisticsStatusSchema, { id: 'InventoryStatisticsStatusEnum' });
}
