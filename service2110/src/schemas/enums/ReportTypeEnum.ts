import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

// Enum для типов отчётов
export enum ReportTypeEnum {
  LSOZ = 'LSOZ',
  LSOS = 'LSOS',
  LSOP = 'LSOP',
  KROS_VOS = 'KROS_VOS',
  KROS_VZS = 'KROS_VZS',
  KROS = 'KROS',
}

// Мапа описаний для каждого значения enum
const ReportTypeDescriptions = {
  [ReportTypeEnum.LSOZ]: { value: ReportTypeEnum.LSOZ, description: 'LSOZ' },
  [ReportTypeEnum.LSOS]: { value: ReportTypeEnum.LSOS, description: 'LSOS' },
  [ReportTypeEnum.LSOP]: { value: ReportTypeEnum.LSOP, description: 'LSOP' },
  [ReportTypeEnum.KROS_VOS]: { value: ReportTypeEnum.KROS_VOS, description: 'KROS_VOS' },
  [ReportTypeEnum.KROS_VZS]: { value: ReportTypeEnum.KROS_VZS, description: 'KROS_VZS' },
  [ReportTypeEnum.KROS]: { value: ReportTypeEnum.KROS, description: 'KROS' },
} as const;
// Создаем схему через enum (который возвращает ZodEnum)
export const reportTypeSchema = z.enum(ReportTypeEnum).describe('Тип отчёта');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const ReportTypeEnumSchema = createEnumSchemaWithDescriptions(
  ReportTypeEnum,
  ReportTypeDescriptions,
  'ReportTypeEnum',
  'Тип отчёта'
);
