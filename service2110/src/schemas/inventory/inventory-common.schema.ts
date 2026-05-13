import { z } from 'zod';

import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryReportStatusSchema } from './enums/InventoryReportStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';

export const inventoryInventoryStateQuerySchema = z.object({
  inventoryOrderId: zUuidSchema.optional(),
});

export { inventoryProcessStatusSchema };

export const inventoryInventoryStateResponseSchema = z.object({
  inventoryOrderId: zUuidSchema.optional(),
  orderNumber: z.string().optional(),
  orderDate: dateSchema.optional(),
  inventoryDateFrom: dateSchema.optional(),
  inventoryDateTo: dateSchema.optional(),
  isActive: z.boolean().optional(),
  status: inventoryProcessStatusSchema.optional(),
});

export const inventoryColumnsQuerySchema = z.object({
  tableName: z.string(),
})

export const inventoryColumnsUpdateSchema = z.object({
  tableName: z.string(),
  columnName: z.string(),
  isVisible: z.boolean(),
});

export const inventoryColumnSchema = z.object({
  columnName: z.string(),
  isVisible: z.boolean(),
});

export const inventoryColumnsResponseSchema = z.array(inventoryColumnSchema);

export const inventoryExportParamsSchema = z.object({
  bs2: z.array(zIdSchema).optional(),
  accountNum: z.string().optional(),
  accountType: z.array(zIdSchema).optional(),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleUnitType: z.array(z.string()).optional(),
  inventoryAccountStatus: z.array(z.string()).optional(),
  sourceBank: z.array(z.string()).optional(),
  productName: z.array(z.string()).optional(),
  manualControlRuleNumber: z.array(zIdSchema).optional(),
  showZeroBalanceAccounts: z.boolean().optional(),
  isExclude: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const inventoryReportExportItemSchema = z.object({
  id: zUuidSchema,
  fullName: z.string(),
  exportParams: inventoryExportParamsSchema,
  filePath: z.string(),
  status: inventoryReportStatusSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const inventoryActiveStateSchema = z.object({
  status: inventoryProcessStatusSchema,
});