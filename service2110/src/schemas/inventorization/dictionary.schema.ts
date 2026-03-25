import { z } from 'zod';

import { zIdSchema } from '../common.schema.ts';

export const inventorizationInventoryOrderIdParamSchema = z.object({
  inventoryOrderId: zIdSchema,
});

/** Ответ фильтра БС-2: только id и bs2Name (без value и orderId). */
export const inventorizationBs2FilterItemSchema = z.object({
  id: zIdSchema,
  bs2Name: z.string(),
});

export const inventorizationBs2FilterResponseSchema = z.object({
  items: z.array(inventorizationBs2FilterItemSchema),
});

export const inventorizationDictionaryItemSchema = z.object({
  id: zIdSchema,
  name: z.string(),
});

export const inventorizationDictionaryListResponseSchema = z.object({
  items: z.array(inventorizationDictionaryItemSchema),
});
