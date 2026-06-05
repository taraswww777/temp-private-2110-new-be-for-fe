import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { inventoryAccountListItemSchema } from './accounts.schema.ts';

export const inventoryApprovalListFilterSchema = z.object({
  bs2: z.array(zIdSchema).optional().describe('БС-2 (массив int)'),
  originalResponsibleUnit: z.array(z.string()).optional(),
  responsibleUnit: z.array(z.string()).optional().describe('Подразделение, ответственное по счёту'),
  productName: z.array(z.string()).optional(),
  senderAdLogin: z.array(z.string()).optional(),
}).describe('Фильтр для списка счетов');

export const getInventoryApprovalListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  filters: inventoryApprovalListFilterSchema,
});

export const inventoryApprovalListResponseSchema = z.object({
  itemsList: z.array(inventoryAccountListItemSchema).describe('Список счетов'),
  totalItems: z.number().int().min(0).describe('Общее количество счетов'),
});
