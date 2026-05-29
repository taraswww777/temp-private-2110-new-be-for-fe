import { inventoryProcessStatusSchema } from './InventoryProcessStatusEnum.ts';
import { inventoryAssignmentsSchema, inventoryReportStatusSchema, inventoryUserRolesSchema } from './InventoryReportStatusEnum.ts';

import { registerOpenApiComponent } from '../../utils/registerOpenApiComponent.ts';
import { inventoryEntityTypeSchema } from './InventoryEntityTypeEnum.ts';

/**
 * Регистрация Zod-схем перечислений подсистемы инвентаризации в OpenAPI-реестре.
 */
export function registerInventoryEnumsOpenApiSchemas() {
  registerOpenApiComponent(inventoryProcessStatusSchema, 'InventoryProcessStatusEnum');
  registerOpenApiComponent(inventoryReportStatusSchema, 'InventoryReportStatusEnum');
  registerOpenApiComponent(inventoryUserRolesSchema, 'InventoryUserRolesEnum');
  registerOpenApiComponent(inventoryAssignmentsSchema, 'InventoryAssignmentsEnum');
  registerOpenApiComponent(inventoryEntityTypeSchema, 'InventoryEntityTypeEnum');
}
