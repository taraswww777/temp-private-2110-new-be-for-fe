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
 * Переиспользуемая схема для integer ID
 * Используется, для создания ссылок в OpenAPI спецификации
 */
export const zIdSchema = z.number().int().positive().describe('Integer ID').min(1);

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

export type ID = z.infer<typeof zIdSchema>;

/**
 * Схема для integer ID параметров
 */
export const idParamSchema = z.object({
  id: zIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Схема для RFC 7807 Problem Details ошибок
 */
export const problemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string().optional(),
  errors: z.array(z.object({
    path: z.string(),
    message: z.string(),
  })).optional(),
});

export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
