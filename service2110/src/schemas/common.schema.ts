import { z } from 'zod';

/**
 * Схема для пагинации в query параметрах
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0).describe('Номер страницы (начиная с 0)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Количество элементов на странице'),
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
  page: z.number().int().min(0).describe('Текущий номер страницы'),
  limit: z.number().int().min(1).max(100).describe('Размер страницы'),
  totalItems: z.number().int().min(0).describe('Общее количество элементов'),
  totalPages: z.number().int().min(0).describe('Общее количество страниц'),
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

/**
 * Схема для фильтрации данных
 */
export const filterSchema = z.object({
  column: z.string().describe('Колонка для фильтрации'),
  operator: z.enum(['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']).describe('Оператор сравнения'),
  value: z.string().describe('Значение для фильтрации'),
});

export type Filter = z.infer<typeof filterSchema>;
