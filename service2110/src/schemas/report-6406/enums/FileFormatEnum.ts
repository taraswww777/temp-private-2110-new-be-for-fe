import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

// Enum для форматов
export enum FileFormatEnum {
  /** Текстовый формат */
  TXT = 'TXT',
  /** Excel формат */
  XLSX = 'XLSX',
  /** XML формат */
  XML = 'XML',
}

// Мапа описаний для каждого значения enum
const FileFormatDescriptions = {
  [FileFormatEnum.TXT]: { value: FileFormatEnum.TXT, description: 'Текстовый формат' },
  [FileFormatEnum.XLSX]: { value: FileFormatEnum.XLSX, description: 'Excel формат' },
  [FileFormatEnum.XML]: { value: FileFormatEnum.XML, description: 'XML формат' },
} as const;

// Создаем простую схему через enum
export const fileFormatSchema = z.enum(FileFormatEnum).describe('Формат файла');

// Создаем расширенную схему с описаниями
export const FileFormatEnumSchema = createEnumSchemaWithDescriptions(
  FileFormatEnum,
  FileFormatDescriptions,
  'FileFormatEnum',
  'Формат файла отчёта',
);

(function registerFileFormatEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(fileFormatSchema, 'FileFormatEnum');
})();
