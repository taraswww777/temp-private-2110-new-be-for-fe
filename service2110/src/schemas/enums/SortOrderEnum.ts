import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

/**
 * Направление сортировки.
 *
 * - ASC — по возрастанию (от А до Я, от старых к новым);
 * - DESC — по убыванию (от Я до А, от новых к старым).
 */
export enum SortOrderEnum {
  /** Сортировка по возрастанию. */
  ASC = 'ASC',

  /** Сортировка по убыванию. */
  DESC = 'DESC',
}

/**
 * Мапа описаний для каждого значения `SortOrderEnum`.
 * Используется для генерации расширенной OpenAPI-схемы с `x-enum-*` метаданными.
 */
const SortOrderDescriptions = {
  [SortOrderEnum.ASC]:  { value: SortOrderEnum.ASC,  description: 'Сортировка по возрастанию' },
  [SortOrderEnum.DESC]: { value: SortOrderEnum.DESC, description: 'Сортировка по убыванию' },
} as const;

/**
 * Zod-схема для направления сортировки.
 * Используется в схемах API как тип поля `direction`.
 */
export const sortOrderSchema = z
  .enum(SortOrderEnum)
  .default(SortOrderEnum.DESC)
  .describe('Направление сортировки');

/**
 * Расширенная JSON Schema для OpenAPI (`components.schemas.SortOrderEnum`).
 * Содержит значения enum, описания и varnames, используемые генераторами клиентов.
 */
export const SortOrderEnumSchema = createEnumSchemaWithDescriptions(
  SortOrderEnum,
  SortOrderDescriptions,
  'SortOrderEnum',
  'Направление сортировки',
);
