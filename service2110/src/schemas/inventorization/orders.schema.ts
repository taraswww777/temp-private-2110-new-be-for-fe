import { z } from 'zod';

import { paginationQuerySchema, zIdSchema } from '../common.schema.ts';
import { sortOrderSchema } from '../enums/SortOrderEnum.ts';

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
  filters: inventoryOrdersListFilterSchema.describe('Фильтры списка приказов'),
});

export const inventoryOrderListItemSchema = z.object({
  id: zIdSchema,
  orderNumber: z.string().optional(),
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
