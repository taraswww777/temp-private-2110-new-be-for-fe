import { z } from 'zod';


import { zIdSchema } from '../common/id.schema.ts';

export const inventorizationStatisticsExportRequestSchema = z.object({
  inventoryOrderId: zIdSchema.optional(),
  format: z.enum(['xlsx', 'csv']).optional(),
});

export const inventorizationStatisticsExportResponseSchema = z.object({
  fileKey: z.string().optional(),
});
