import { z } from 'zod';

/**
 * Переиспользуемая схема для integer ID
 * Используется, для создания ссылок в OpenAPI спецификации
 */
export const zIdSchema = z.number().int().positive().describe('Integer ID').min(1);

export type ID = z.infer<typeof zIdSchema>;

/**
 * Схема для integer ID параметров, в GET параметрах
 */
export const idParamSchema = z.object({ id: zIdSchema });

export const idListSchema = z.array(zIdSchema);

