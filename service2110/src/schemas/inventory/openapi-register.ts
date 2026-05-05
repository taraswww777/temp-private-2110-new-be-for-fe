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
  inventoryInventoryOrderIdParamSchema,
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
  inventoryAccountIdParamSchema,
  accountVersionedIdSchema,
  accountVersionedIdsSchema,
  inventoryAccountUpdatedResponseSchema,
  inventoryDecimalStringSchema,
  inventoryAccountListSortColumnSchema,
  inventoryAccountsListSortingSchema,
} from './accounts.schema.ts';
import {
  inventoryStatisticsExportRequestSchema,
  inventoryStatisticsExportResponseSchema,
  inventoryStatisticsFilterSchema,
} from './statistics.schema.ts';
import {
  inventoryActiveStateSchema,
  inventoryColumnSchema,
  inventoryColumnsResponseSchema,
  inventoryColumnsUpdateSchema,
  inventoryInventoryStateResponseSchema,
  inventoryReportExportItemSchema,
  inventoryInventoryStateQuerySchema,
  inventoryColumnsQuerySchema,
} from './inventory-common.schema.ts';

import { registerOpenApiComponent } from '../utils/registerOpenApiComponent.ts';

/**
 * Регистрация Zod-схем подсистемы инвентаризации (front API-28) в OpenAPI-реестре.
 */
export function registerInventoryOpenApiSchemas() {
  registerInventoryEnumsOpenApiSchemas();

  registerOpenApiComponent(inventoryInventoryOrderIdParamSchema, 'InventoryInventoryOrderIdParamDto');
  registerOpenApiComponent(inventoryInventoryStateQuerySchema, 'InventoryInventoryStateQueryDto');
  registerOpenApiComponent(inventoryColumnsQuerySchema, 'InventoryColumnsQueryDto');

  registerOpenApiComponent(inventoryDecimalStringSchema, 'InventoryDecimalStringDto');
  registerOpenApiComponent(inventoryAccountListSortColumnSchema, 'InventoryAccountListSortColumnEnum');
  registerOpenApiComponent(inventoryAccountsListSortingSchema, 'InventoryAccountsListSortingDto');
  registerOpenApiComponent(inventoryAccountIdParamSchema, 'InventoryAccountIdParamDto');

  registerOpenApiComponent(inventoryOrderListItemSchema, 'InventoryOrderListItemDto');
  registerOpenApiComponent(inventoryOrdersListResponseSchema, 'InventoryOrdersListResponseDto');
  registerOpenApiComponent(createInventoryOrderSchema, 'InventoryCreateOrderDto');
  registerOpenApiComponent(updateInventoryOrderSchema, 'InventoryUpdateOrderDto');
  registerOpenApiComponent(inventoryOrderMutationResponseSchema, 'InventoryOrderMutationResponseDto');

  registerOpenApiComponent(inventoryBs2FilterItemSchema, 'InventoryBs2FilterItemDto');
  registerOpenApiComponent(inventoryBs2FilterResponseSchema, 'InventoryBs2FilterResponseDto');
  registerOpenApiComponent(inventoryAccountTypeFilterItemSchema, 'InventoryAccountTypeFilterItemDto');
  registerOpenApiComponent(inventoryAccountTypeFilterResponseSchema, 'InventoryAccountTypeFilterResponseDto');
  registerOpenApiComponent(inventoryResponsibleUnitFilterItemSchema, 'InventoryResponsibleUnitFilterItemDto');
  registerOpenApiComponent(inventoryResponsibleUnitFilterResponseSchema, 'InventoryResponsibleUnitFilterResponseDto');
  registerOpenApiComponent(inventoryResponsibleUnitTypeFilterItemSchema, 'InventoryResponsibleUnitTypeFilterItemDto');
  registerOpenApiComponent(inventoryResponsibleUnitTypeFilterResponseSchema, 'InventoryResponsibleUnitTypeFilterResponseDto');
  registerOpenApiComponent(inventoryAccountStatusFilterItemSchema, 'InventoryAccountStatusFilterItemDto');
  registerOpenApiComponent(inventoryAccountStatusFilterResponseSchema, 'InventoryAccountStatusFilterResponseDto');
  registerOpenApiComponent(inventorySourceBankFilterItemSchema, 'InventorySourceBankFilterItemDto');
  registerOpenApiComponent(inventorySourceBankFilterResponseSchema, 'InventorySourceBankFilterResponseDto');
  registerOpenApiComponent(inventoryProductFilterItemSchema, 'InventoryProductFilterItemDto');
  registerOpenApiComponent(inventoryProductFilterResponseSchema, 'InventoryProductFilterResponseDto');
  registerOpenApiComponent(inventoryManualControlFilterItemSchema, 'InventoryManualControlFilterItemDto');
  registerOpenApiComponent(inventoryManualControlFilterResponseSchema, 'InventoryManualControlFilterResponseDto');

  registerOpenApiComponent(inventoryAccountsListFilterSchema, 'InventoryAccountsListFilterDto');
  registerOpenApiComponent(getInventoryAccountsListRequestSchema, 'InventoryGetAccountsListRequestDto');
  registerOpenApiComponent(inventoryAccountsListResponseSchema, 'InventoryAccountsListResponseDto');
  registerOpenApiComponent(inventoryAccountListItemSchema, 'InventoryAccountListItemDto');
  registerOpenApiComponent(inventoryAccountStatusSingleSchema, 'InventoryAccountStatusSingleDto');
  registerOpenApiComponent(accountVersionedIdSchema, 'InventoryAccountVersionedIdDto');
  registerOpenApiComponent(accountVersionedIdsSchema, 'InventoryAccountVersionedIdsDto');
  registerOpenApiComponent(inventoryAccountUpdatedResponseSchema, 'InventoryAccountUpdatedResponseDto');
  registerOpenApiComponent(inventoryAccountDetailSchema, 'InventoryAccountDetailDto');
  registerOpenApiComponent(inventoryAccountHistoryItemSchema, 'InventoryAccountHistoryItemDto');
  registerOpenApiComponent(inventoryAccountHistoryResponseSchema, 'InventoryAccountHistoryResponseDto');
  registerOpenApiComponent(inventoryManualUnitRequestSchema, 'InventoryManualUnitRequestDto');
  registerOpenApiComponent(inventoryManualUnitBulkRequestSchema, 'InventoryManualUnitBulkRequestDto');
  registerOpenApiComponent(inventoryAccountIdsSchema, 'InventoryAccountsIdsDto');
  registerOpenApiComponent(inventoryAccountIdSchema, 'InventoryAccountsIdDto');
  registerOpenApiComponent(inventoryAccountsExportRequestSchema, 'InventoryAccountsExportRequestDto');
  registerOpenApiComponent(inventoryAccountsExportResponseSchema, 'InventoryAccountsExportResponseDto');

  registerOpenApiComponent(inventoryStatisticsFilterSchema, 'InventoryStatisticsFilterDto');
  registerOpenApiComponent(inventoryStatisticsExportRequestSchema, 'InventoryStatisticsExportRequestDto');
  registerOpenApiComponent(inventoryStatisticsExportResponseSchema, 'InventoryStatisticsResponseDto');

  registerOpenApiComponent(inventoryColumnSchema, 'InventoryColumnDto');
  registerOpenApiComponent(inventoryColumnsResponseSchema, 'InventoryColumnsResponseDto');
  registerOpenApiComponent(inventoryColumnsUpdateSchema, 'InventoryColumnsUpdateDto');
  registerOpenApiComponent(inventoryInventoryStateResponseSchema, 'InventoryInventoryStateResponseDto');
  registerOpenApiComponent(inventoryReportExportItemSchema, 'InventoryReportExportItemDto');
  registerOpenApiComponent(inventoryActiveStateSchema, 'InventoryActiveStateDto');
}
