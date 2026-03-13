import { z } from 'zod';
import { taskStatusSchema } from '../enums/TaskStatusEnum.ts';
import { zIdSchema } from '../common.schema.ts';

/**
 * Схема для записи истории статуса
 */
export const statusHistoryItemSchema = z.object({
  id: zIdSchema,
  taskId: zIdSchema,
  taskStatus: taskStatusSchema,
  changeAt: z.iso.datetime().describe('Дата и время изменения'),
  changeBy: z.string().describe('Инициатор изменения. Логин или ФИО'),
  note: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional().describe('Дополнительные метаданные в формате ключ-значение'),
});

export type StatusHistoryItem = z.infer<typeof statusHistoryItemSchema>;

/**
 * Схема для ответа со списком истории статусов (простой массив без пагинации)
 * История изменений статусов обычно небольшая (десятки записей), поэтому пагинация не требуется
 */
export const statusHistoryResponseSchema = z.array(statusHistoryItemSchema);

export type StatusHistoryResponse = z.infer<typeof statusHistoryResponseSchema>;
