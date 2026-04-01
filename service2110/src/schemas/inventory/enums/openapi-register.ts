import type { OpenApiSchemaRegistry } from '../../report-6406/openapi-register.ts';

import { inventoryProcessStatusSchema } from './InventoryProcessStatusEnum.ts';

/**
 * Регистрация Zod-схем перечислений подсистемы инвентаризации в OpenAPI-реестре.
 */
export function registerInventoryEnumsOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registry.add(inventoryProcessStatusSchema, { id: 'InventoryProcessStatusEnum' });
}
