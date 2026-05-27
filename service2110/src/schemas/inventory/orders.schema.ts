import { z } from 'zod';

import { dateTimeSchema } from '../common/dateString.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';

/** Элемент списка приказов — поля ответа DOC; `orderFileLink` вместо сырого binary. */
export const inventoryOrderListItemSchema = z.object({
  inventoryOrderId: zUuidSchema,
  orderNumber: z.string().describe('Номер приказа'),
  orderDate: dateTimeSchema.describe('Дата приказа'),
  inventoryDateFrom: dateTimeSchema.describe('Дата начала инвентаризации'),
  inventoryDateTo: dateTimeSchema.describe('Дата окончания инвентаризации'),
  orderFileLink: z.string().optional().describe('Ссылка на файл приказа (DOC: orderFileLink)'),
  isActive: z.boolean().optional().describe('Приказ актуален на данный момент'),
  inventoryOrderStatus: inventoryProcessStatusSchema,
});

export const inventoryOrdersListResponseSchema = z.array(inventoryOrderListItemSchema);

export const createInventoryOrderSchema = z.object({
  orderNumber: z.string(),
  orderDate: dateTimeSchema,
  inventoryDateFrom: dateTimeSchema,
  inventoryDateTo: dateTimeSchema,
  orderFile: z.string('Ссылка на файл'),
});

export const updateInventoryOrderSchema = z.object({
  inventoryOrderId: zUuidSchema,
  orderNumber: z.string(),
  orderDate: dateTimeSchema,
  inventoryDateFrom: dateTimeSchema,
  inventoryDateTo: dateTimeSchema,
  orderFile: z.string('Ссылка на файл'),
  isActive: z.boolean(),
});

export const inventoryOrderMutationResponseSchema = z.object({
  inventoryOrderId: zUuidSchema,
});
