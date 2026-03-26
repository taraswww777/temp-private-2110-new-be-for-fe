import { z } from 'zod';

import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';

export const inventoryOrderListSortColumnSchema = z.enum([
  'id',
  'createdAt',
  'orderNumber',
  'status',
]);

export const inventoryOrdersListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: inventoryOrderListSortColumnSchema.describe('Колонка для сортировки'),
});

export const inventoryOrdersListFilterSchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
  statusId: zIdSchema.optional(),
}).optional();

export const getInventoryOrdersListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: inventoryOrdersListSortingSchema.describe('Сортировка'),
});

export const inventoryOrderListItemSchema = z.object({
  id: zIdSchema,
  orderNumber: z.string().describe('Номер приказа'),
  orderDate: dateSchema.describe('Дата приказа YYYY-MM-DD'),
  inventoryDateFrom: dateSchema.describe('Дата начала инвентаризации'),
  inventoryDateTo: dateSchema.describe('Дата окончания инвентаризации'),
  orderFile: z.string().optional().describe('Ссылка на скачивание файла из S3'),
  isActive: z.boolean().optional().describe('Флаг, указывающий, что приказ актуален на данный момент').default(true),
  createdAt: z.iso.datetime().optional(),
});

export const inventoryOrdersListResponseSchema = z.object({
  items: z.array(inventoryOrderListItemSchema),
  totalItems: z.number().int().min(0),
});

/** Создание приказа (поле adLogin с фронта не передаётся). */
export const createInventoryOrderSchema = z.object({
  title: z.string(),
});

export const updateInventoryOrderSchema = z.object({
  id: zIdSchema,
  title: z.string().optional(),
  statusId: zIdSchema.optional(),
});

export const inventoryOrderMutationResponseSchema = z.object({
  id: zIdSchema,
});
