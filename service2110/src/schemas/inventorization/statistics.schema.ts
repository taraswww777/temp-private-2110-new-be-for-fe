import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { inventoryAccountsListFilterFieldsSchema } from './accounts.schema.ts';

export const inventorizationStatisticsExportRequestSchema = z.object({
  filters: inventoryAccountsListFilterFieldsSchema.optional().describe('Те же фильтры, что у списка счетов'),
  inventoryOrderId: zIdSchema.optional(),
  format: z.enum(['xlsx', 'csv']).optional(),
});

export const inventorizationStatisticsExportResponseSchema = z.object({
  fileKey: z.string().optional(),
});
