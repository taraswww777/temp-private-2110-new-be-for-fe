import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { inventoryAccountsListFilterSchema } from './accounts.schema.ts';

export const inventoryStatisticsExportRequestSchema = z.object({
  filter: inventoryAccountsListFilterSchema,
  inventoryOrderId: zIdSchema.optional(),
  format: z.enum(['xlsx', 'csv']).optional(),
});

export const inventoryStatisticsExportResponseSchema = z.object({
  fileKey: z.string().optional(),
});
