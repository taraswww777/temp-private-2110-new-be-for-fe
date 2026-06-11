import { z } from 'zod';

import { dateTimeSchema } from '../common/dateString.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';

export const inventoryOrderListItemSchema = z.object({
  inventoryOrderId: zUuidSchema,
  orderNumber: z.string().describe('Номер приказа'),
  orderDate: dateTimeSchema.describe('Дата приказа'),
  inventoryDateFrom: dateTimeSchema.describe('Дата начала инвентаризации'),
  inventoryDateTo: dateTimeSchema.describe('Дата окончания инвентаризации'),

  isActive: z.boolean().optional().describe('Приказ актуален на данный момент'),
  inventoryOrderStatus: inventoryProcessStatusSchema,
  orderFileLink: z.string().optional().describe('Ссылка на скачивание файла из S3')
});

export const inventoryOrdersListResponseSchema = z.array(inventoryOrderListItemSchema);

export const createInventoryOrderSchema = z.object({
  orderNumber: z.string(),
  orderDate: dateTimeSchema,
  inventoryDateFrom: dateTimeSchema,
  inventoryDateTo: dateTimeSchema,
});

export const updateInventoryOrderSchema = z.object({
  inventoryOrderId: zUuidSchema,
  orderNumber: z.string(),
  orderDate: dateTimeSchema,
  inventoryDateFrom: dateTimeSchema,
  inventoryDateTo: dateTimeSchema,
});

export const inventoryOrderMutationResponseSchema = z.object({
  inventoryOrderId: zUuidSchema,
});
