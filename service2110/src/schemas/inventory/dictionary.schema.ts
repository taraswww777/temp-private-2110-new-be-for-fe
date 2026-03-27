import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';

export const inventoryInventoryOrderIdParamSchema = z.object({
  inventoryOrderId: zIdSchema,
});

/** Элемент фильтра БС-2 — полный состав DOC (value, привязка к приказу). */
export const inventoryBs2FilterItemSchema = z.object({
  id: zIdSchema,
  bs2Name: z.string(),
  value: z.string().optional().describe('Значение БС-2 (DOC)'),
});

export const inventoryBs2FilterResponseSchema = z.array(inventoryBs2FilterItemSchema);

export const inventoryDictionaryItemSchema = z.object({
  id: zIdSchema,
  name: z.string(),
});

export const inventoryDictionaryListResponseSchema = z.array(inventoryDictionaryItemSchema);
