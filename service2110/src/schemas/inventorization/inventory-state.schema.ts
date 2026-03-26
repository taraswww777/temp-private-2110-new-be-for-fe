import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';

export const inventorizationInventoryStateQuerySchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
});

export { inventoryProcessStatusSchema };

export const inventorizationInventoryStateResponseSchema = z.object({
  status: inventoryProcessStatusSchema.optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  orderDataFilled: z.boolean().optional().describe('Заполнены данными приказа'),
});
