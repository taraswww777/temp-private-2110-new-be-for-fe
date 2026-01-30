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

/**
 * Переиспользуемая схема для даты в формате YYYY-MM-DD
 * Используется в query параметрах для фильтрации по датам
 */
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Дата в формате YYYY-MM-DD');

export type DateString = z.infer<typeof dateSchema>;

/**
 * Переиспользуемая схема для даты-времени в формате ISO 8601
 * Используется в query параметрах для фильтрации по датам создания/обновления
 */
export const dateTimeSchema = z.string().datetime().describe('Дата и время в формате ISO 8601');

export type DateTimeString = z.infer<typeof dateTimeSchema>;

/**
 * Схема ответа GET /health (200 OK)
 */
export const healthResponseSchema = z.object({
  status: z.string().describe('Статус приложения'),
  timestamp: z.string().describe('Время ответа в ISO 8601'),
  database: z.string().describe('Статус подключения к БД'),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

/**
 * Схема ответа об ошибке с полем instance (503 и др.)
 */
export const httpErrorWithInstanceSchema = z.object({
  type: z.string().describe('URI типа ошибки'),
  title: z.string().describe('Заголовок ошибки'),
  status: z.number().int().describe('HTTP статус'),
  detail: z.string().describe('Детали ошибки'),
  instance: z.string().describe('URI запроса'),
});

export type HttpErrorWithInstance = z.infer<typeof httpErrorWithInstanceSchema>;
