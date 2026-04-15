import { z } from 'zod';

import { dateSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';

/** Элемент списка приказов — поля ответа DOC; `orderFileLink` вместо сырого binary. */
export const inventoryOrderListItemSchema = z.object({
  invertoryOrderId: z.uuid(),
  orderNumber: z.string().describe('Номер приказа'),
  orderDate: dateSchema.describe('Дата приказа YYYY-MM-DD'),
  inventoryDateFrom: dateSchema.describe('Дата начала инвентаризации'),
  inventoryDateTo: dateSchema.describe('Дата окончания инвентаризации'),
  orderFileLink: z.string().optional().describe('Ссылка на файл приказа (DOC: orderFileLink)'),
  isActive: z.boolean().optional().describe('Приказ актуален на данный момент'),
});

export const inventoryOrdersListResponseSchema = z.array(inventoryOrderListItemSchema);

export const createInventoryOrderSchema = z.object({
  orderNumber: z.string(),
  orderDate: dateSchema,
  inventoryDateFrom: dateSchema,
  inventoryDateTo: dateSchema,
  orderFile: z.string('Ссылка на файл'),
});

export const updateInventoryOrderSchema = z.object({
  invertoryOrderId: z.uuid(),
  orderNumber: z.string(),
  orderDate: dateSchema,
  inventoryDateFrom: dateSchema,
  inventoryDateTo: dateSchema,
  orderFile: z.string('Ссылка на файл'),
  isActive: z.boolean(),
});

export const inventoryOrderMutationResponseSchema = z.object({
  invertoryOrderId: z.uuid(),
});
