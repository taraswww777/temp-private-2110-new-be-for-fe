import { z } from 'zod';

import { zIdSchema } from '../common.schema.ts';

export const inventorizationInventoryStateQuerySchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
});

export const inventorizationInventoryStateResponseSchema = z.object({
  status: z.string().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
});
