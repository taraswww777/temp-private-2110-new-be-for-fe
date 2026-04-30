import { z } from 'zod';
import { idListSchema, zIdSchema } from './id.schema.ts';

/**
 * Схема для массового удаления заданий
 */
export const processRequestSchema = idListSchema.min(1);

export const processResultItemSchema = z.object({
  id: zIdSchema,
  success: z.boolean(),
  reason: z.string().optional(),
});
/**
 * Схема для ответа при массовой операции
 */
export const processResponseSchema = z.object({
  succeeded: z.number().int().min(0).describe('Количество успешно удалённых записей'),
  failed: z.number().int().min(0).describe('Количество записей, которые не удалось удалить'),
  results: z.array(processResultItemSchema),
});
