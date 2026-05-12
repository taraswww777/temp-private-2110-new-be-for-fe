import { z } from 'zod';

import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryReportStatusSchema } from './enums/InventoryReportStatusEnum.ts';

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

export const inventoryReportExportItemSchema = z.object({
  id: zUuidSchema,
  fullName: z.string(),
  exportParams: z.string().describe("JSON-строка с параметрами"),
  filePath: z.string(),
  status: inventoryReportStatusSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const inventoryActiveStateSchema = z.object({
  status: inventoryProcessStatusSchema,
});