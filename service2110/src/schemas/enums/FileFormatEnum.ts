import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

// Enum для форматов
export enum FileFormat {
  TXT = 'TXT',
  XLSX = 'XLSX',
  XML = 'XML',
}

// Мапа описаний для каждого значения enum
const FileFormatDescriptions = {
  [FileFormat.TXT]: { value: FileFormat.TXT, description: 'Текстовый формат' },
  [FileFormat.XLSX]: { value: FileFormat.XLSX, description: 'Excel формат' },
  [FileFormat.XML]: { value: FileFormat.XML, description: 'XML формат' },
} as const;

// Создаем простую схему через enum
export const fileFormatSchema = z.enum(FileFormat).describe('Формат файла');

// Создаем расширенную схему с описаниями
export const FileFormatEnumSchema = createEnumSchemaWithDescriptions(
  FileFormat,
  FileFormatDescriptions,
  'FileFormatEnum',
  'Формат файла отчёта'
);
