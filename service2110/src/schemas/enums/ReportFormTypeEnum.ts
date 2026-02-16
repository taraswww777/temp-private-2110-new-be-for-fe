import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

/**
 * Тип формы отчетности
 */
enum ReportFormTypeEnum {
  N3462D = 'N3462D',
  KROS = 'KROS',
  N6406D = 'N6406D',
}

// Мапа описаний для каждого значения enum
const ReportFormTypeDescriptions = {
  [ReportFormTypeEnum.N3462D]: {
    value: ReportFormTypeEnum.N3462D,
    description: '3462у: Информация об открытых и закрытых счетах, Информация о счетах. Остатки, Информация о счетах. Операции'
  },
  [ReportFormTypeEnum.KROS]: {
    value: ReportFormTypeEnum.KROS,
    description: 'КРОС: КРОС, Ведомость открытых счетов, Ведомость закрытых счетов'
  },
  [ReportFormTypeEnum.N6406D]: {
    value: ReportFormTypeEnum.N6406D,
    description: '6406у: Информация об открытых и закрытых счетах, Информация о счетах. Остатки, Информация о счетах. Операции'
  }
} as const;
// Создаем схему через nativeEnum (который возвращает ZodEnum)
export const reportTypeSchema = z.enum(ReportFormTypeEnum).describe('Тип формы отчетности');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const ReportFormTypeEnumSchema = createEnumSchemaWithDescriptions(
  ReportFormTypeEnum,
  ReportFormTypeDescriptions,
  'ReportFormTypeEnum',
  'Тип формы отчетности'
);
