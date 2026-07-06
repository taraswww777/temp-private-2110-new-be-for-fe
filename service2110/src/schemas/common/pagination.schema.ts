import { z } from 'zod';

/**
 * Схема для пагинации в query параметрах (PaginationRequestDto по задаче: number, size)
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe('Номер страницы (начиная с 1)'),
  limit: z.coerce.number().int().min(1).max(100).default(20).describe('Размер страницы'),
}).describe('Параметры пагинации');
