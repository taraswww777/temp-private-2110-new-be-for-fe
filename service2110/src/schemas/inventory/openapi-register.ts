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
  inventoryAccountStatusGroupFilterItemSchema,
  inventoryOrderFilterItemSchema,
  inventoryAccountStatusFilterResponseSchema,
  inventoryOrderFilterResponseSchema,
  inventoryControlTypeFilterItemSchema,
  inventoryControlTypeFilterResponseSchema,
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
  inventorySenderNamesFilterResponseSchema,
  inventorySenderNamesFilterItemSchema,
  inventoryAccountStatusGroupFilterResponseSchema,
} from './dictionary.schema.ts';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountsListFilterSchema,
  inventoryAccountDetailSchema,
  inventoryAccountListItemSchema,
  inventoryAccountHistoryItemSchema,
  inventoryAccountHistoryRequestSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryManualUnitRequestSchema,
  inventoryManualUnitBulkRequestSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsExportResponseSchema,
  inventoryAccountStatusSingleRequestSchema,
  inventoryAccountStatusSingleSchema,
  inventoryAccountIdsSchema,
  inventoryAccountIdParamSchema,
  accountVersionedIdSchema,
  accountVersionedIdsSchema,
  inventoryAccountUpdatedResponseSchema,
  inventoryDecimalSchema,
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
  inventoryExportParamsSchema,
  inventoryFileSchema,
} from './inventory-common.schema.ts';

import { registerOpenApiComponent } from '../utils/registerOpenApiComponent.ts';
import { register } from 'node:module';
import { getInventoryApprovalListRequestSchema, inventoryApprovalListFilterSchema, inventoryApprovalListResponseSchema } from './approval.schema.ts';
import { getInventoryStatementListRequestSchema, inventoryStatementListExportFilterSchema, inventoryStatementListFilterSchema, inventoryStatementListItemSchema, inventoryStatementListResponseSchema, inventoryStatementsExportRequestSchema, inventoryStatementsExportResponseSchema } from './statement.schema.ts';

/**
 * Регистрация Zod-схем подсистемы инвентаризации (front API-28) в OpenAPI-реестре.
 */
export function registerInventoryOpenApiSchemas() {
  registerInventoryEnumsOpenApiSchemas();

  registerOpenApiComponent(inventoryInventoryOrderIdParamSchema, 'InventoryInventoryOrderIdParamDto');
  registerOpenApiComponent(inventoryInventoryStateQuerySchema, 'InventoryInventoryStateQueryDto');
  registerOpenApiComponent(inventoryColumnsQuerySchema, 'InventoryColumnsQueryDto');

  registerOpenApiComponent(inventoryDecimalSchema, 'InventoryDecimalDto');
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
  registerOpenApiComponent(inventoryAccountStatusGroupFilterItemSchema, 'InventoryAccountStatusGroupFilterItemDto');
  registerOpenApiComponent(inventoryAccountStatusFilterResponseSchema, 'InventoryAccountStatusFilterResponseDto');
  registerOpenApiComponent(inventoryAccountStatusGroupFilterResponseSchema, 'InventoryAccountStatusGroupFilterResponseDto');
  registerOpenApiComponent(inventoryOrderFilterItemSchema, 'InventoryOrderFilterItemDto');
  registerOpenApiComponent(inventoryControlTypeFilterItemSchema, 'InventoryControlTypeFilterItemDto');
  registerOpenApiComponent(inventoryOrderFilterResponseSchema, 'InventoryOrderFilterResponseDto');
  registerOpenApiComponent(inventoryControlTypeFilterResponseSchema, 'InventoryControlTypeFilterResponseDto');
  registerOpenApiComponent(inventorySourceBankFilterItemSchema, 'InventorySourceBankFilterItemDto');
  registerOpenApiComponent(inventorySourceBankFilterResponseSchema, 'InventorySourceBankFilterResponseDto');
  registerOpenApiComponent(inventoryProductFilterItemSchema, 'InventoryProductFilterItemDto');
  registerOpenApiComponent(inventoryProductFilterResponseSchema, 'InventoryProductFilterResponseDto');
  registerOpenApiComponent(inventoryManualControlFilterItemSchema, 'InventoryManualControlFilterItemDto');
  registerOpenApiComponent(inventoryManualControlFilterResponseSchema, 'InventoryManualControlFilterResponseDto');
  registerOpenApiComponent(inventorySenderNamesFilterItemSchema, 'InventorySenderNamesFilterItemDto');
  registerOpenApiComponent(inventorySenderNamesFilterResponseSchema, 'InventorySenderNamesFilterResponseDto');

  registerOpenApiComponent(inventoryAccountsListFilterSchema, 'InventoryAccountsListFilterDto');
  registerOpenApiComponent(inventoryExportParamsSchema, 'InventoryExportParamsDto');
  registerOpenApiComponent(getInventoryAccountsListRequestSchema, 'InventoryGetAccountsListRequestDto');
  registerOpenApiComponent(inventoryAccountsListResponseSchema, 'InventoryAccountsListResponseDto');
  registerOpenApiComponent(inventoryAccountListItemSchema, 'InventoryAccountListItemDto');
  registerOpenApiComponent(inventoryAccountStatusSingleSchema, 'InventoryAccountStatusSingleDto');
  registerOpenApiComponent(inventoryAccountStatusSingleRequestSchema, 'InventoryAccountStatusSingleRequestDto');  
  registerOpenApiComponent(accountVersionedIdSchema, 'InventoryAccountVersionedIdDto');
  registerOpenApiComponent(accountVersionedIdsSchema, 'InventoryAccountVersionedIdsDto');
  registerOpenApiComponent(inventoryAccountUpdatedResponseSchema, 'InventoryAccountUpdatedResponseDto');
  registerOpenApiComponent(inventoryAccountDetailSchema, 'InventoryAccountDetailDto');
  registerOpenApiComponent(inventoryAccountHistoryItemSchema, 'InventoryAccountHistoryItemDto');
  registerOpenApiComponent(inventoryAccountHistoryRequestSchema, 'InventoryAccountHistoryRequestDto');
  registerOpenApiComponent(inventoryAccountHistoryResponseSchema, 'InventoryAccountHistoryResponseDto');
  registerOpenApiComponent(inventoryManualUnitRequestSchema, 'InventoryManualUnitRequestDto');
  registerOpenApiComponent(inventoryManualUnitBulkRequestSchema, 'InventoryManualUnitBulkRequestDto');
  registerOpenApiComponent(inventoryAccountIdsSchema, 'InventoryAccountsIdsDto');
  registerOpenApiComponent(inventoryAccountsExportRequestSchema, 'InventoryAccountsExportRequestDto');
  registerOpenApiComponent(inventoryAccountsExportResponseSchema, 'InventoryAccountsExportResponseDto');

  registerOpenApiComponent(inventoryStatementListFilterSchema, 'InventoryStatementListFilterDto');
  registerOpenApiComponent(inventoryStatementListExportFilterSchema, 'InventoryStatementListExportFilterDto');
  registerOpenApiComponent(getInventoryStatementListRequestSchema, 'InventoryGetStatementListRequestDto');
  registerOpenApiComponent(inventoryStatementListItemSchema, 'InventoryStatementListItemDto');
  registerOpenApiComponent(inventoryStatementListResponseSchema, 'InventoryStatementListResponseDto');
  registerOpenApiComponent(inventoryStatementsExportRequestSchema, 'InventoryStatementsExportRequestDto');
   registerOpenApiComponent(inventoryStatementsExportResponseSchema, 'InventoryStatementsExportResponseDto');

  registerOpenApiComponent(inventoryApprovalListFilterSchema, 'InventoryApprovalListFilterDto');
  registerOpenApiComponent(getInventoryApprovalListRequestSchema, 'InventoryGetApprovalListRequestDto');
  registerOpenApiComponent(inventoryApprovalListResponseSchema, 'InventoryApprovalListResponseDto');

  registerOpenApiComponent(inventoryStatisticsFilterSchema, 'InventoryStatisticsFilterDto');
  registerOpenApiComponent(inventoryStatisticsExportRequestSchema, 'InventoryStatisticsExportRequestDto');
  registerOpenApiComponent(inventoryStatisticsExportResponseSchema, 'InventoryStatisticsResponseDto');

  registerOpenApiComponent(inventoryColumnSchema, 'InventoryColumnDto');
  registerOpenApiComponent(inventoryColumnsResponseSchema, 'InventoryColumnsResponseDto');
  registerOpenApiComponent(inventoryColumnsUpdateSchema, 'InventoryColumnsUpdateDto');
  registerOpenApiComponent(inventoryInventoryStateResponseSchema, 'InventoryInventoryStateResponseDto');
  registerOpenApiComponent(inventoryReportExportItemSchema, 'InventoryReportExportItemDto');
  registerOpenApiComponent(inventoryActiveStateSchema, 'InventoryActiveStateDto');
  registerOpenApiComponent(inventoryFileSchema, 'InventoryFileDto');
}
