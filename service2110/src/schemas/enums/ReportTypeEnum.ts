import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

// Enum для типов отчётов
export enum ReportTypeEnum {
  /** LSOZ */
  LSOZ = 'LSOZ',
  /** LSOS */
  LSOS = 'LSOS',
  /** LSOP */
  LSOP = 'LSOP',
}

// Мапа описаний для каждого значения enum
const ReportTypeDescriptions = {
  [ReportTypeEnum.LSOZ]: { value: ReportTypeEnum.LSOZ, description: 'LSOZ' },
  [ReportTypeEnum.LSOS]: { value: ReportTypeEnum.LSOS, description: 'LSOS' },
  [ReportTypeEnum.LSOP]: { value: ReportTypeEnum.LSOP, description: 'LSOP' },
} as const;
/**  Создаем схему через enum (который возвращает ZodEnum) */
export const reportTypeSchema = z.enum(ReportTypeEnum).describe('Тип отчёта');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const ReportTypeEnumSchema = createEnumSchemaWithDescriptions(
  ReportTypeEnum,
  ReportTypeDescriptions,
  'ReportTypeEnum',
  'Тип отчёта'
);
