import { z } from 'zod';

import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';

export const inventoryOrderListSortColumnSchema = z.enum([
  'id',
  'createdAt',
  'orderNumber',
]);

export const inventoryOrdersListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: inventoryOrderListSortColumnSchema.describe('Колонка для сортировки'),
});

/** Тело POST …/orders/list — как `getTasksRequestSchema` в report-6406, без блока filters. */
export const getInventoryOrdersListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: inventoryOrdersListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
});

/** Элемент списка приказов — поля ответа DOC; `orderFileLink` вместо сырого binary. */
export const inventoryOrderListItemSchema = z.object({
  id: zIdSchema,
  orderNumber: z.string().describe('Номер приказа'),
  orderDate: dateSchema.describe('Дата приказа YYYY-MM-DD'),
  inventoryDateFrom: dateSchema.describe('Дата начала инвентаризации'),
  inventoryDateTo: dateSchema.describe('Дата окончания инвентаризации'),
  orderFileLink: z.string().optional().describe('Ссылка на файл приказа (DOC: orderFileLink)'),
  isActive: z.boolean().optional().describe('Приказ актуален на данный момент'),
  createdAt: z.iso.datetime().optional(),
});

export const inventoryOrdersListResponseSchema = z.object({
  items: z.array(inventoryOrderListItemSchema),
  totalItems: z.number().int().min(0),
});

/** Создание приказа — поля тела DOC (adLogin с фронта не передаётся). */
export const createInventoryOrderSchema = z.object({
  orderNumber: z.string(),
  orderDate: dateSchema,
  inventoryDateFrom: dateSchema,
  inventoryDateTo: dateSchema,
  orderFile: z.string().optional().describe('Файл приказа: в DOC binary; в JSON — base64 или отдельная загрузка'),
});

export const updateInventoryOrderSchema = z.object({
  id: zIdSchema,
  orderNumber: z.string().optional(),
  orderDate: dateSchema.optional(),
  inventoryDateFrom: dateSchema.optional(),
  inventoryDateTo: dateSchema.optional(),
  orderFile: z.string().optional(),
});

export const inventoryOrderMutationResponseSchema = z.object({
  id: zIdSchema,
});
