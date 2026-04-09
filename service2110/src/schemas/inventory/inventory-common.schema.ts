import { z } from 'zod';

import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';

export const inventoryInventoryStateQuerySchema = z.object({
  inventoryOrderId: z.string().optional(),
});

export { inventoryProcessStatusSchema };

export const inventoryInventoryStateResponseSchema = z.object({
  inventoryOrderId: z.string().optional(),
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
