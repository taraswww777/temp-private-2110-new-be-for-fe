import { z } from 'zod';

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
