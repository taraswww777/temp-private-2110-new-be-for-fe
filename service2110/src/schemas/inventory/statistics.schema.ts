import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { inventoryReportExportItemSchema } from './inventory-common.schema.ts';

export const inventoryStatisticsFilterSchema = z.object({
  bs2: z.array(zIdSchema).optional().describe("БС-2 (массив int)"),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleUnitType: z.array(z.string()).optional(),
  productName: z.array(z.string()).optional(),
});

export const inventoryStatisticsExportRequestSchema = z.object({
  filters: inventoryStatisticsFilterSchema,
});

export const inventoryStatisticsExportResponseSchema = z.array(
  inventoryReportExportItemSchema,
);
