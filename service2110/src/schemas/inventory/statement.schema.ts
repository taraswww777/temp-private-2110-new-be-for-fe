import { z } from 'zod';

import { dateTimeSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { inventoryDecimalSchema } from './accounts.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryReportExportItemSchema } from './inventory-common.schema.ts';

export const inventoryStatementListFilterSchema = z.object({
  inventoryOrderId: zUuidSchema,
  bs2: z.array(zIdSchema).optional().describe('БС-2 (массив int)'),
  accountNum: z.string().optional().describe('Номер счёта (accountNum в DOC)'),
  accountType: z.array(zIdSchema).optional().describe('Типы счёта (массив)'),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleEmployeeAdLogin: z.array(z.string()).optional(),
  inventoryAccountGroupId: z.array(zIdSchema).optional(),
  controlType: z.array(z.string()).optional(),
  manualControlRuleNumber: z.array(zIdSchema).optional(),
});

export const getInventoryStatementListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  filters: inventoryStatementListFilterSchema,
});

export const inventoryStatementListItemSchema = z.object({
  accountId: zUuidSchema,
  bs2: zIdSchema.optional(),
  accountNum: z.string().optional(),
  accountName: z.string().optional(),
  productName: z.string().optional(),
  accountOpenDate: dateTimeSchema.optional(),
  accountType: zIdSchema.optional(),
  responsibleUnit: z.string().optional(),
  accountOutRubSum: inventoryDecimalSchema.optional(),
  accountOutSum: inventoryDecimalSchema.optional(),
  manualControlFlag: z.boolean().optional(),
  inventoryAccountStatusName: z.string().optional(),
  inventoryUpdatedBy: z.string().optional(),
  inventoryUpdatedAt: dateTimeSchema.optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  accountState: z.string().optional(),
});

export const inventoryStatementListResponseSchema = z.object({
  itemsList: z.array(inventoryStatementListItemSchema),
  totalItems: z.number().int().min(0),
});

export const inventoryStatementListExportFilterSchema = inventoryStatementListFilterSchema.extend({
  addAdditionalFields: z.boolean().optional(),
});
export const inventoryStatementsExportRequestSchema = z.object({
  accountIds: z.array(zUuidSchema).optional(),
  filters: inventoryStatementListExportFilterSchema.optional(),
});

export const inventoryStatementsExportResponseSchema = z.array(
    inventoryReportExportItemSchema,
)