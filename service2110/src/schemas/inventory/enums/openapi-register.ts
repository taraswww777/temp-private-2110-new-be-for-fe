import { inventoryProcessStatusSchema } from './InventoryProcessStatusEnum.ts';
import { inventoryReportStatusSchema } from './InventoryReportStatusEnum.ts';

import { registerOpenApiComponent } from '../../utils/registerOpenApiComponent.ts';
import { inventoryEntityTypeSchema } from './InventoryEntityTypeEnum.ts';
import { inventoryControlTypeSchema } from './InventoryControlTypeEnum.ts';

/**
 * Регистрация Zod-схем перечислений подсистемы инвентаризации в OpenAPI-реестре.
 */
export function registerInventoryEnumsOpenApiSchemas() {
  registerOpenApiComponent(inventoryProcessStatusSchema, 'InventoryProcessStatusEnum');
  registerOpenApiComponent(inventoryReportStatusSchema, 'InventoryReportStatusEnum');
  registerOpenApiComponent(inventoryEntityTypeSchema, 'InventoryEntityTypeEnum');
  registerOpenApiComponent(inventoryControlTypeSchema, 'InventoryControlTypeEnum');
}
