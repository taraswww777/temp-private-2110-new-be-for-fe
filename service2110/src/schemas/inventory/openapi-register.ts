import type { OpenApiSchemaRegistry } from '../report-6406/openapi-register.ts';
import { registerInventoryEnumsOpenApiSchemas } from './enums/openapi-register.ts';
import {
  getInventoryOrdersListRequestSchema,
  inventoryOrdersListResponseSchema,
  createInventoryOrderSchema,
  updateInventoryOrderSchema,
  inventoryOrderMutationResponseSchema,
  inventoryOrderListItemSchema,
} from './orders.schema.ts';
import {
  inventoryBs2FilterItemSchema,
  inventoryBs2FilterResponseSchema,
  inventoryDictionaryItemSchema,
  inventoryDictionaryListResponseSchema,
} from './dictionary.schema.ts';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountsListFilterSchema,
  inventoryAccountDetailSchema,
  inventoryAccountListItemSchema,
  inventoryAccountHistoryItemSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryManualUnitBulkRequestSchema,
  inventoryManualUnitSingleRequestSchema,
  inventoryManualUnitResponseSchema,
  inventoryAccountsInventoryRequestSchema,
  inventoryAccountsInventoryExcludeRequestSchema,
  inventoryAccountsInventoryMutationResponseSchema,
  inventoryAccountColumnSchema,
  inventoryAccountColumnsResponseSchema,
  inventoryAccountColumnsUpdateSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsExportResponseSchema,
} from './accounts.schema.ts';
import {
  inventoryStatisticsExportRequestSchema,
  inventoryStatisticsExportResponseSchema,
} from './statistics.schema.ts';
import { inventoryInventoryStateResponseSchema } from './inventory-state.schema.ts';

/**
 * Регистрация Zod-схем подсистемы инвентаризации (front API-28) в OpenAPI-реестре.
 */
export function registerInventoryOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registerInventoryEnumsOpenApiSchemas(registry);

  registry.add(inventoryOrderListItemSchema, { id: 'InventoryOrderListItemDto' });
  registry.add(getInventoryOrdersListRequestSchema, { id: 'InventoryGetOrdersListRequestDto' });
  registry.add(inventoryOrdersListResponseSchema, { id: 'InventoryOrdersListResponseDto' });
  registry.add(createInventoryOrderSchema, { id: 'InventoryCreateOrderDto' });
  registry.add(updateInventoryOrderSchema, { id: 'InventoryUpdateOrderDto' });
  registry.add(inventoryOrderMutationResponseSchema, { id: 'InventoryOrderMutationResponseDto' });

  registry.add(inventoryBs2FilterItemSchema, { id: 'InventoryBs2FilterItemDto' });
  registry.add(inventoryBs2FilterResponseSchema, { id: 'InventoryBs2FilterResponseDto' });
  registry.add(inventoryDictionaryItemSchema, { id: 'InventoryDictionaryItemDto' });
  registry.add(inventoryDictionaryListResponseSchema, { id: 'InventoryDictionaryListResponseDto' });

  registry.add(inventoryAccountsListFilterSchema, { id: 'ШnventoryAccountsListFilterDto' });
  registry.add(getInventoryAccountsListRequestSchema, { id: 'InventoryGetAccountsListRequestDto' });
  registry.add(inventoryAccountsListResponseSchema, { id: 'InventoryAccountsListResponseDto' });
  registry.add(inventoryAccountListItemSchema, { id: 'InventoryAccountListItemDto' });
  registry.add(inventoryAccountDetailSchema, { id: 'InventoryAccountDetailDto' });
  registry.add(inventoryAccountHistoryItemSchema, { id: 'InventoryAccountHistoryItemDto' });
  registry.add(inventoryAccountHistoryResponseSchema, { id: 'InventoryAccountHistoryResponseDto' });
  registry.add(inventoryManualUnitBulkRequestSchema, { id: 'InventoryManualUnitBulkRequestDto' });
  registry.add(inventoryManualUnitSingleRequestSchema, { id: 'InventoryManualUnitSingleRequestDto' });
  registry.add(inventoryManualUnitResponseSchema, { id: 'InventoryManualUnitResponseDto' });
  registry.add(inventoryAccountsInventoryRequestSchema, { id: 'InventoryAccountsInventoryRequestDto' });
  registry.add(inventoryAccountsInventoryExcludeRequestSchema, { id: 'InventoryAccountsInventoryExcludeRequestDto' });
  registry.add(inventoryAccountsInventoryMutationResponseSchema, { id: 'InventoryAccountsInventoryMutationResponseDto' });
  registry.add(inventoryAccountColumnSchema, { id: 'InventoryAccountColumnDto' });
  registry.add(inventoryAccountColumnsResponseSchema, { id: 'InventoryAccountColumnsResponseDto' });
  registry.add(inventoryAccountColumnsUpdateSchema, { id: 'InventoryAccountColumnsUpdateDto' });
  registry.add(inventoryAccountsExportRequestSchema, { id: 'InventoryAccountsExportRequestDto' });
  registry.add(inventoryAccountsExportResponseSchema, { id: 'InventoryAccountsExportResponseDto' });

  registry.add(inventoryStatisticsExportRequestSchema, { id: 'InventoryStatisticsExportRequestDto' });
  registry.add(inventoryStatisticsExportResponseSchema, { id: 'InventoryStatisticsExportResponseDto' });

  registry.add(inventoryInventoryStateResponseSchema, { id: 'InventoryInventoryStateResponseDto' });
}
