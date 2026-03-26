import { z } from 'zod';

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
