import { z } from 'zod';

import { paginationQuerySchema } from '../common.schema.ts';
import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';

export const inventoryAccountListSortColumnSchema = z.enum([
  'id',
  'accountNumber',
  'accountSurrogateId',
  'updatedAt',
]);

export const inventoryAccountsListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: inventoryAccountListSortColumnSchema.describe('Колонка для сортировки'),
});

export const inventoryAccountsListFilterSchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
  accountSurrogateId: zIdSchema.optional(),
  accountTypeId: zIdSchema.optional(),
}).optional();

export const getInventoryAccountsListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: inventoryAccountsListSortingSchema.describe('Сортировка'),
  filters: inventoryAccountsListFilterSchema.describe('Фильтры списка счетов'),
});

export const inventoryAccountListItemSchema = z.object({
  id: zIdSchema,
  accountSurrogateId: zIdSchema,
  accountNumber: z.string().optional(),
});

export const inventoryAccountsListResponseSchema = z.object({
  items: z.array(inventoryAccountListItemSchema),
  totalItems: z.number().int().min(0),
});

export const inventoryAccountDetailSchema = z.object({
  id: zIdSchema,
  accountSurrogateId: zIdSchema,
  accountNumber: z.string().optional(),
});

export const inventoryAccountHistoryItemSchema = z.object({
  id: zIdSchema,
  changedAt: z.iso.datetime(),
  action: z.string(),
});

export const inventoryAccountHistoryResponseSchema = z.object({
  items: z.array(inventoryAccountHistoryItemSchema),
});

export const inventoryAccountSurrogateIdParamSchema = z.object({
  accountSurrogateId: zIdSchema,
});

/** Массовая пометка ручного учёта: массив surrogate id в body. */
export const inventoryManualUnitBulkRequestSchema = z.object({
  accountSurrogateIds: z.array(zIdSchema).min(1),
});

export const inventoryManualUnitResponseSchema = z.object({
  updated: z.number().int().min(0),
});

export const inventoryAccountsInventoryRequestSchema = z.object({
  inventoryOrderId: zIdSchema,
  accountIds: z.array(zIdSchema).optional(),
});

export const inventoryAccountsInventoryExcludeRequestSchema = z.object({
  inventoryOrderId: zIdSchema,
  accountIds: z.array(zIdSchema).min(1),
});

export const inventoryAccountsInventoryMutationResponseSchema = z.object({
  affected: z.number().int().min(0),
});

export const inventorizationAccountColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  visible: z.boolean().optional(),
});

export const inventorizationAccountColumnsResponseSchema = z.object({
  columns: z.array(inventorizationAccountColumnSchema),
});

export const inventorizationAccountColumnsUpdateSchema = z.object({
  columns: z.array(inventorizationAccountColumnSchema),
});

export const inventoryAccountsExportRequestSchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
  format: z.enum(['xlsx', 'csv']).optional(),
});

export const inventoryAccountsExportResponseSchema = z.object({
  fileKey: z.string().optional(),
});
