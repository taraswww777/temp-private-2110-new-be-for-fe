import { z } from 'zod';

/**
 * Переиспользуемая схема для UUID
 * Используется, для создания ссылок в OpenAPI спецификации
 */
export const zUuidSchema = z.uuid().describe('UUID');

export type UUID = z.infer<typeof zUuidSchema>;

/**
 * Схема для UUID параметров
 */
export const uuidParamSchema = z.object({
  uuid: zUuidSchema,
});

export type UuidParam = z.infer<typeof uuidParamSchema>;
