import { z } from 'zod';

/**
 * Переиспользуемая схема для ErrorDTO
 * Используется для описания ошибок в OpenAPI спецификации
 */
export const zErrorDTOSchema = z.object({
  status: z.string().describe('Текстовый код статуса'),
  error: z.string().describe('Текст сообщения об ошибке'),
});

export type ErrorDTOSchema = z.infer<typeof zErrorDTOSchema>;
