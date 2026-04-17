import type { OpenApiSchemaRegistry } from '../report-6406/openapi-register.ts';
import { registerInventoryEnumsOpenApiSchemas } from './enums/openapi-register.ts';
import {
  inventoryOrdersListResponseSchema,
  createInventoryOrderSchema,
  updateInventoryOrderSchema,
  inventoryOrderMutationResponseSchema,
  inventoryOrderListItemSchema,
} from './orders.schema.ts';
import {
  inventoryAccountStatusFilterItemSchema,
  inventoryAccountStatusFilterResponseSchema,
  inventoryAccountTypeFilterItemSchema,
  inventoryAccountTypeFilterResponseSchema,
  inventoryBs2FilterItemSchema,
  inventoryBs2FilterResponseSchema,
  inventoryManualControlFilterItemSchema,
  inventoryManualControlFilterResponseSchema,
  inventoryProductFilterItemSchema,
  inventoryProductFilterResponseSchema,
  inventoryResponsibleUnitFilterItemSchema,
  inventoryResponsibleUnitFilterResponseSchema,
  inventoryResponsibleUnitTypeFilterItemSchema,
  inventoryResponsibleUnitTypeFilterResponseSchema,
  inventorySourceBankFilterItemSchema,
  inventorySourceBankFilterResponseSchema,
} from './dictionary.schema.ts';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountsListFilterSchema,
  inventoryAccountDetailSchema,
  inventoryAccountListItemSchema,
  inventoryAccountHistoryItemSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryManualUnitRequestSchema,
  inventoryManualUnitBulkRequestSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsExportResponseSchema,
  inventoryAccountStatusSingleSchema,
  inventoryAccountIdsSchema,
  inventoryAccountIdSchema,
  accountVersionedIdSchema,
  accountVersionedIdsSchema,
  inventoryAccountUpdatedResponseSchema,
} from './accounts.schema.ts';
import {
  inventoryStatisticsExportRequestSchema,
  inventoryStatisticsExportResponseSchema,
  inventoryStatisticsFilterSchema,
} from './statistics.schema.ts';
import {
  inventoryColumnSchema,
  inventoryColumnsResponseSchema,
  inventoryColumnsUpdateSchema,
  inventoryInventoryStateResponseSchema,
  inventoryReportExportItemSchema,
} from "./inventory-common.schema.ts";
/**
 * Регистрация Zod-схем подсистемы инвентаризации (front API-28) в OpenAPI-реестре.
 */
export function registerInventoryOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registerInventoryEnumsOpenApiSchemas(registry);

  registry.add(inventoryOrderListItemSchema, { id: 'InventoryOrderListItemDto' });
  registry.add(inventoryOrdersListResponseSchema, { id: 'InventoryOrdersListResponseDto' });
  registry.add(createInventoryOrderSchema, { id: 'InventoryCreateOrderDto' });
  registry.add(updateInventoryOrderSchema, { id: 'InventoryUpdateOrderDto' });
  registry.add(inventoryOrderMutationResponseSchema, { id: 'InventoryOrderMutationResponseDto' });

  registry.add(inventoryBs2FilterItemSchema, { id: 'InventoryBs2FilterItemDto' });
  registry.add(inventoryBs2FilterResponseSchema, { id: 'InventoryBs2FilterResponseDto' });
  registry.add(inventoryAccountTypeFilterItemSchema, { id: 'InventoryAccountTypeFilterItemDto' });
  registry.add(inventoryAccountTypeFilterResponseSchema, { id: 'InventoryAccountTypeFilterResponseDto' });
  registry.add(inventoryResponsibleUnitFilterItemSchema, { id: 'InventoryResponsibleUnitFilterItemDto' });
  registry.add(inventoryResponsibleUnitFilterResponseSchema, { id: 'InventoryResponsibleUnitFilterResponseDto' });
  registry.add(inventoryResponsibleUnitTypeFilterItemSchema, { id: 'InventoryResponsibleUnitTypeFilterItemDto' });
  registry.add(inventoryResponsibleUnitTypeFilterResponseSchema, { id: 'InventoryResponsibleUnitTypeFilterResponseDto' });
  registry.add(inventoryAccountStatusFilterItemSchema, { id: 'InventoryAccountStatusFilterItemDto' });
  registry.add(inventoryAccountStatusFilterResponseSchema, { id: 'InventoryAccountStatusFilterResponseDto' });
  registry.add(inventorySourceBankFilterItemSchema, { id: 'InventorySourceBankFilterItemDto' });
  registry.add(inventorySourceBankFilterResponseSchema, { id: 'InventorySourceBankFilterResponseDto' });
  registry.add(inventoryProductFilterItemSchema, { id: 'InventoryProductFilterItemDto' });
  registry.add(inventoryProductFilterResponseSchema, { id: 'InventoryProductFilterResponseDto' });
  registry.add(inventoryManualControlFilterItemSchema, { id: 'InventoryManualControlFilterItemDto' });
  registry.add(inventoryManualControlFilterResponseSchema, { id: 'InventoryManualControlFilterResponseDto' });
  
  registry.add(inventoryAccountsListFilterSchema, { id: 'InventoryAccountsListFilterDto' });
  registry.add(getInventoryAccountsListRequestSchema, { id: 'InventoryGetAccountsListRequestDto' });
  registry.add(inventoryAccountsListResponseSchema, { id: 'InventoryAccountsListResponseDto' });
  registry.add(inventoryAccountListItemSchema, { id: 'InventoryAccountListItemDto' });
  registry.add(inventoryAccountStatusSingleSchema, { id: 'InventoryAccountStatusSingleDto' });
  registry.add(accountVersionedIdSchema, { id: 'InventoryAccountVersionedIdDto' });
  registry.add(accountVersionedIdsSchema, { id: 'InventoryAccountVersionedIdsDto' });
  registry.add(inventoryAccountUpdatedResponseSchema, { id: 'InventoryAccountUpdatedResponseDto' });
  registry.add(inventoryAccountDetailSchema, { id: 'InventoryAccountDetailDto' });
  registry.add(inventoryAccountHistoryItemSchema, { id: 'InventoryAccountHistoryItemDto' });
  registry.add(inventoryAccountHistoryResponseSchema, { id: 'InventoryAccountHistoryResponseDto' });
  registry.add(inventoryManualUnitRequestSchema, { id: 'InventoryManualUnitRequestDto' });
  registry.add(inventoryManualUnitBulkRequestSchema, { id: 'InventoryManualUnitBulkRequestDto' });
  registry.add(inventoryAccountIdsSchema, { id: 'InventoryAccountsIdsDto' });
  registry.add(inventoryAccountIdSchema, { id: 'InventoryAccountsIdDto' });
  registry.add(inventoryAccountsExportRequestSchema, { id: 'InventoryAccountsExportRequestDto' });
  registry.add(inventoryAccountsExportResponseSchema, { id: 'InventoryAccountsExportResponseDto' });

  registry.add(inventoryStatisticsFilterSchema, { id: 'InventoryStatisticsFilterDto' });
  registry.add(inventoryStatisticsExportRequestSchema, { id: 'InventoryStatisticsExportRequestDto' });
  registry.add(inventoryStatisticsExportResponseSchema, { id: 'InventoryStatisticsResponseDto' });

  registry.add(inventoryColumnSchema, { id: 'InventoryColumnDto' });
  registry.add(inventoryColumnsResponseSchema, { id: 'InventoryColumnsResponseDto' });
  registry.add(inventoryColumnsUpdateSchema, { id: 'InventoryColumnsUpdateDto' });
  registry.add(inventoryInventoryStateResponseSchema, { id: 'InventoryInventoryStateResponseDto' });
  registry.add(inventoryReportExportItemSchema, { id: 'InventoryReportExportItemDto' });
}
