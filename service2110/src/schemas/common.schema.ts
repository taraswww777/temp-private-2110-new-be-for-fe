import { z } from 'zod';
import { sortOrderSchema } from './enums/SortOrderEnum';

/**
 * Схема для пагинации в query параметрах (PaginationRequestDto по задаче: number, size)
 */
export const paginationQuerySchema = z.object({
  number: z.coerce.number().int().min(1).default(1).describe('Номер страницы (начиная с 1)'),
  size: z.coerce.number().int().min(1).max(100).default(20).describe('Размер страницы'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Схема для сортировки (SortingRequestDto): direction + column
 */
export const sortingRequestSchema = z.object({
  direction: z.enum(['asc', 'desc']).describe('Направление сортировки'),
  column: z.string().describe('Колонка для сортировки'),
});

export type SortingRequest = z.infer<typeof sortingRequestSchema>;

export type SortOrder = z.infer<typeof sortOrderSchema>;

/**
 * Метаданные пагинации в ответе (number, size, totalItems, totalPages)
 */
export const paginationMetadataSchema = z.object({
  number: z.number().int().min(1).describe('Текущий номер страницы'),
  size: z.number().int().min(1).max(100).describe('Размер страницы'),
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
 * Переиспользуемая схема для UUID
 * Используется для создания ссылок в OpenAPI спецификации
 */
export const uuidSchema = z.uuid().describe('UUID в формате RFC 4122');

export type Uuid = z.infer<typeof uuidSchema>;

/**
 * Схема для UUID параметров
 */
export const uuidParamSchema = z.object({
  id: uuidSchema,
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
export const dateTimeSchema = z.iso.datetime().describe('Дата и время в формате ISO 8601');

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
