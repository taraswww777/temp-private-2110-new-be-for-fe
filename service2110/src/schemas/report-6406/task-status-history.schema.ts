import { z } from 'zod';
import { reportTaskStatusSchema } from './tasks.schema.js';

/**
 * Схема для записи истории статуса
 */
export const statusHistoryItemSchema = z.object({
  id: z.string().uuid(),
  status: reportTaskStatusSchema,
  previousStatus: reportTaskStatusSchema.nullable(),
  changedAt: z.string().datetime(),
  changedBy: z.string().nullable(),
  comment: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
});

export type StatusHistoryItem = z.infer<typeof statusHistoryItemSchema>;

/**
 * Схема для ответа со списком истории статусов (простой массив без пагинации)
 * История изменений статусов обычно небольшая (десятки записей), поэтому пагинация не требуется
 */
export const statusHistoryResponseSchema = z.array(statusHistoryItemSchema);

export type StatusHistoryResponse = z.infer<typeof statusHistoryResponseSchema>;
