import type { OpenApiSchemaRegistry } from '../report-6406/openapi-register.ts';
import { registerInventorizationEnumsOpenApiSchemas } from './enums/openapi-register.ts';
import {
  getInventoryOrdersListRequestSchema,
  inventoryOrdersListResponseSchema,
  createInventoryOrderSchema,
  updateInventoryOrderSchema,
  inventoryOrderMutationResponseSchema,
  inventoryOrderListItemSchema,
} from './orders.schema.ts';
import {
  inventorizationBs2FilterItemSchema,
  inventorizationBs2FilterResponseSchema,
  inventorizationDictionaryItemSchema,
  inventorizationDictionaryListResponseSchema,
} from './dictionary.schema.ts';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountsListFilterFieldsSchema,
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
  inventorizationAccountColumnSchema,
  inventorizationAccountColumnsResponseSchema,
  inventorizationAccountColumnsUpdateSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsExportResponseSchema,
} from './accounts.schema.ts';
import {
  inventorizationStatisticsExportRequestSchema,
  inventorizationStatisticsExportResponseSchema,
} from './statistics.schema.ts';
import { inventorizationInventoryStateResponseSchema } from './inventory-state.schema.ts';

/**
 * Регистрация Zod-схем подсистемы инвентаризации (front API-28) в OpenAPI-реестре.
 */
export function registerInventorizationOpenApiSchemas(registry: OpenApiSchemaRegistry) {
  registerInventorizationEnumsOpenApiSchemas(registry);

  registry.add(inventoryOrderListItemSchema, { id: 'InventorizationOrderListItemDto' });
  registry.add(getInventoryOrdersListRequestSchema, { id: 'InventorizationGetOrdersListRequestDto' });
  registry.add(inventoryOrdersListResponseSchema, { id: 'InventorizationOrdersListResponseDto' });
  registry.add(createInventoryOrderSchema, { id: 'InventorizationCreateOrderDto' });
  registry.add(updateInventoryOrderSchema, { id: 'InventorizationUpdateOrderDto' });
  registry.add(inventoryOrderMutationResponseSchema, { id: 'InventorizationOrderMutationResponseDto' });

  registry.add(inventorizationBs2FilterItemSchema, { id: 'InventorizationBs2FilterItemDto' });
  registry.add(inventorizationBs2FilterResponseSchema, { id: 'InventorizationBs2FilterResponseDto' });
  registry.add(inventorizationDictionaryItemSchema, { id: 'InventorizationDictionaryItemDto' });
  registry.add(inventorizationDictionaryListResponseSchema, { id: 'InventorizationDictionaryListResponseDto' });

  registry.add(inventoryAccountsListFilterFieldsSchema, { id: 'InventorizationAccountsListFilterFieldsDto' });
  registry.add(getInventoryAccountsListRequestSchema, { id: 'InventorizationGetAccountsListRequestDto' });
  registry.add(inventoryAccountsListResponseSchema, { id: 'InventorizationAccountsListResponseDto' });
  registry.add(inventoryAccountListItemSchema, { id: 'InventorizationAccountListItemDto' });
  registry.add(inventoryAccountDetailSchema, { id: 'InventorizationAccountDetailDto' });
  registry.add(inventoryAccountHistoryItemSchema, { id: 'InventorizationAccountHistoryItemDto' });
  registry.add(inventoryAccountHistoryResponseSchema, { id: 'InventorizationAccountHistoryResponseDto' });
  registry.add(inventoryManualUnitBulkRequestSchema, { id: 'InventorizationManualUnitBulkRequestDto' });
  registry.add(inventoryManualUnitSingleRequestSchema, { id: 'InventorizationManualUnitSingleRequestDto' });
  registry.add(inventoryManualUnitResponseSchema, { id: 'InventorizationManualUnitResponseDto' });
  registry.add(inventoryAccountsInventoryRequestSchema, { id: 'InventorizationAccountsInventoryRequestDto' });
  registry.add(inventoryAccountsInventoryExcludeRequestSchema, { id: 'InventorizationAccountsInventoryExcludeRequestDto' });
  registry.add(inventoryAccountsInventoryMutationResponseSchema, { id: 'InventorizationAccountsInventoryMutationResponseDto' });
  registry.add(inventorizationAccountColumnSchema, { id: 'InventorizationAccountColumnDto' });
  registry.add(inventorizationAccountColumnsResponseSchema, { id: 'InventorizationAccountColumnsResponseDto' });
  registry.add(inventorizationAccountColumnsUpdateSchema, { id: 'InventorizationAccountColumnsUpdateDto' });
  registry.add(inventoryAccountsExportRequestSchema, { id: 'InventorizationAccountsExportRequestDto' });
  registry.add(inventoryAccountsExportResponseSchema, { id: 'InventorizationAccountsExportResponseDto' });

  registry.add(inventorizationStatisticsExportRequestSchema, { id: 'InventorizationStatisticsExportRequestDto' });
  registry.add(inventorizationStatisticsExportResponseSchema, { id: 'InventorizationStatisticsExportResponseDto' });

  registry.add(inventorizationInventoryStateResponseSchema, { id: 'InventorizationInventoryStateResponseDto' });
}
