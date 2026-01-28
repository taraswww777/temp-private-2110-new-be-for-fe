import { z } from 'zod';
import { paginationQuerySchema, paginationResponseSchema } from '../common.schema.js';
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
 * Схема для query параметров истории статусов
 */
export const statusHistoryQuerySchema = paginationQuerySchema;

export type StatusHistoryQuery = z.infer<typeof statusHistoryQuerySchema>;

/**
 * Схема для ответа со списком истории статусов
 */
export const statusHistoryResponseSchema = z.object({
  taskId: z.string().uuid(),
  history: z.array(statusHistoryItemSchema),
  pagination: paginationResponseSchema,
});

export type StatusHistoryResponse = z.infer<typeof statusHistoryResponseSchema>;
