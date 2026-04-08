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
