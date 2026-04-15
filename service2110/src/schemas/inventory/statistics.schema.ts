import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { inventoryStatisticsStatusSchema } from './enums/InventoryStatisticsStatusEnum.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';

export const inventoryStatisticsFilterSchema = z.object({
  bs2: z.array(zIdSchema).optional().describe("БС-2 (массив int)"),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleUnitType: z.array(z.string()).optional(),
  productName: z.array(z.string()).optional(),
});

export const inventoryStatisticsExportRequestSchema = z.object({
  filters: inventoryStatisticsFilterSchema,
});

export const inventoryStatisticsExportItemSchema = z.object({
  id: zUuidSchema,
  fullName: z.string(),
  exportParams: z.string().describe("JSON-строка InventoryStatisticsFilterDto"),
  filePath: z.string(),
  status: inventoryStatisticsStatusSchema.optional(),
  createdAt: dateSchema.optional(),
});

export const inventoryStatisticsExportResponseSchema = z.array(
  inventoryStatisticsExportItemSchema,
);
