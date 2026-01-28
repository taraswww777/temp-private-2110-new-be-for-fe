import { z } from 'zod';

/**
 * Схема для пагинации в query параметрах
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Схема для сортировки в query параметрах
 */
export const sortOrderSchema = z.enum(['ASC', 'DESC']).default('DESC');

export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * Схема для ответа с пагинацией
 */
export const paginationResponseSchema = z.object({
  page: z.number().int().min(0),
  limit: z.number().int().min(1).max(100),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationResponse = z.infer<typeof paginationResponseSchema>;

/**
 * Схема для UUID параметров
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export type UuidParam = z.infer<typeof uuidParamSchema>;

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

/**
 * Упрощённая схема для HTTP ошибок (без валидации URL для type)
 */
export const httpErrorSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
});

export type HttpError = z.infer<typeof httpErrorSchema>;
