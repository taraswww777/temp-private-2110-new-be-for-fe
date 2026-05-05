import { z } from 'zod';
import { taskStatusSchema } from './enums/TaskStatusEnum.ts';

import { zIdSchema } from '../common/id.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Схема для записи истории статуса
 */
export const taskStatusHistoryItemSchema = z.object({
  id: zIdSchema,
  taskId: zIdSchema,
  taskStatus: taskStatusSchema,
  changedAt: z.iso.datetime().describe('Дата и время изменения'),
  changedBy: z.string().describe('Инициатор изменения. Логин или ФИО'),
  note: z.string().optional(),
});

export type TaskStatusHistoryItem = z.infer<typeof taskStatusHistoryItemSchema>;

/**
 * Схема для ответа со списком истории статусов (простой массив без пагинации)
 * История изменений статусов обычно небольшая (десятки записей), поэтому пагинация не требуется
 */
export const taskStatusHistoryResponseSchema = z.array(taskStatusHistoryItemSchema);

export type TaskStatusHistoryResponse = z.infer<typeof taskStatusHistoryResponseSchema>;

(function registerTaskStatusHistoryReport6406OpenApi() {
  registerReport6406OpenApiSchema(taskStatusHistoryItemSchema, 'TaskStatusHistoryItemDto');
  registerReport6406OpenApiSchema(taskStatusHistoryResponseSchema, 'TaskStatusHistoryResponseDto');
})();
