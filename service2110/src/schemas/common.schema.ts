import { z } from 'zod';

/**
 * Схема для пагинации в query параметрах (PaginationRequestDto по задаче: number, size)
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Номер страницы (начиная с 1)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Размер страницы'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Метаданные пагинации в ответе (number, size, totalItems, totalPages)
 */
export const paginationMetadataSchema = z.object({
  page: z.number().int().min(1).describe('Текущий номер страницы'),
  limit: z.number().int().min(1).max(100).describe('Размер страницы'),
  totalItems: z.number().int().min(0).describe('Общее количество элементов'),
  totalPages: z.number().int().min(0).describe('Общее количество страниц'),
});

export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

/**
 * Обобщённая схема пагинированного ответа (шаблон: items + totalItems)
 */
export const paginatedResponseSchema = z.object({
  items: z.array(z.any()).describe('Список элементов'),
  totalItems: z.number().int().min(0).describe('Общее количество элементов'),
});

export type PaginatedResponse = z.infer<typeof paginatedResponseSchema>;

/**
 * Переиспользуемая Zod-схема для номера счёта (ровно 20 цифр).
 *
 * Использование:
 * - `z.array(zAccountSchema)` для списков счетов
 * - `zAccountSchema.optional()` для опциональных полей
 *
 * Валидация:
 * - длина: 20
 * - только цифры: `^\d+$`
 */
export const zAccountSchema = z.string().length(20).regex(/^\d+$/).describe('Счёт (20-значный номер)');

/**
 * Переиспользуемая Zod-схема для счёта/кода второго порядка (ровно 5 цифр).
 *
 * Валидация:
 * - длина: 5
 * - только цифры: `^\d+$`
 */
export const zAccountSecondOrderSchema = z.string().length(5).regex(/^\d+$/).describe('Счёт второго порядка (5-значный номер)');
