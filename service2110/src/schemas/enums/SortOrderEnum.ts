import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

/**
 * Направление сортировки (enum ASC/DESC)
 */
export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Мапа описаний для каждого значения enum
const ReportFormTypeDescriptions = {
  [SortOrderEnum.ASC]: {
    value: SortOrderEnum.ASC,
    description: 'Сортировка от А до Я'
  },
  [SortOrderEnum.DESC]: {
    value: SortOrderEnum.DESC,
    description: 'Сортировка От я до а'
  }
} as const;

export const sortOrderSchema = z.enum(SortOrderEnum).default(SortOrderEnum.DESC).describe('Направление сортировки');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const SortOrderEnumSchema = createEnumSchemaWithDescriptions(
  SortOrderEnum,
  ReportFormTypeDescriptions,
  'SortOrderEnum',
  'Направление сортировки'
);
