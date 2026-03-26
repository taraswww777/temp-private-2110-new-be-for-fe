import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';

export const inventorizationInventoryOrderIdParamSchema = z.object({
  inventoryOrderId: zIdSchema,
});

/** Элемент фильтра БС-2 — полный состав DOC (value, привязка к приказу). */
export const inventorizationBs2FilterItemSchema = z.object({
  id: zIdSchema,
  bs2Name: z.string(),
  value: z.string().optional().describe('Значение БС-2 (DOC)'),
  inventoryOrderId: zIdSchema.optional().describe('ИД приказа инвентаризации (DOC)'),
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
