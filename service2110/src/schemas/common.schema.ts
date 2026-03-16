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
 * Утилитная Zod superRefine-функция для валидации диапазона дат.
 *
 * Правила:
 *  - atLeastOne (default true): хотя бы одно из полей должно быть задано
 *  - если оба заданы: to >= from
 *
 * @param options.fromField  — имя поля «от» (по умолчанию 'periodFrom')
 * @param options.toField    — имя поля «до» (по умолчанию 'periodTo')
 * @param options.atLeastOne — требовать хотя бы одно из полей (default true)
 */
export function dateRangeRefinement(options: {
  fromField?: string;
  toField?: string;
  atLeastOne?: boolean;
} = {}) {
  const { fromField = 'periodFrom', toField = 'periodTo', atLeastOne = true } = options;

  return (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
    const from = data[fromField] as string | undefined;
    const to = data[toField] as string | undefined;

    if (atLeastOne && !from && !to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Должен быть указан хотя бы один из ${fromField} или ${toField}`,
        path: [fromField],
      });
      return;
    }

    if (from && to && new Date(to) < new Date(from)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${toField} must be greater than or equal to ${fromField}`,
        path: [toField],
      });
    }
  };
}

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
