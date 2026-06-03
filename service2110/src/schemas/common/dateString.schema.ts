import { z } from 'zod';

/**
 * Переиспользуемая схема для даты в формате YYYY-MM-DD
 */
export const dateSchema = z.iso.date().describe('Дата в формате YYYY-MM-DD');
/**
 * Переиспользуемая схема для даты-времени в формате ISO 8601
 */
export const dateTimeSchema = z.iso.datetime().describe('Дата и время в формате ISO 8601, например 2026-04-30T11:56:16.055Z');

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
