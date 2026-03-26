import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';

/**
 * Статус конвертации файла.
 *
 * Используется для описания состояния файла отчёта в процессе обработки:
 * - PENDING — файл поставлен в очередь на конвертацию;
 * - CONVERTING — файл сейчас конвертируется;
 * - COMPLETED — конвертация завершена успешно, файл готов к скачиванию;
 * - FAILED — при конвертации произошла ошибка.
 */
export enum FileStatusEnum {
  /** Файл ожидает начала конвертации. */
  PENDING = 'PENDING',

  /** Файл находится в процессе конвертации. */
  CONVERTING = 'CONVERTING',

  /** Конвертация файла успешно завершена. */
  COMPLETED = 'COMPLETED',

  /** Конвертация файла завершилась ошибкой. */
  FAILED = 'FAILED',
}

/**
 * Мапа описаний для каждого значения `FileStatusEnum`.
 * Используется для генерации расширенной OpenAPI-схемы с `x-enum-*` метаданными.
 */
const FileStatusDescriptions = {
  [FileStatusEnum.PENDING]: { value: FileStatusEnum.PENDING, description: 'Ожидает обработки' },
  [FileStatusEnum.CONVERTING]: { value: FileStatusEnum.CONVERTING, description: 'Идёт конвертация файла' },
  [FileStatusEnum.COMPLETED]: { value: FileStatusEnum.COMPLETED, description: 'Конвертация успешно завершена' },
  [FileStatusEnum.FAILED]: { value: FileStatusEnum.FAILED, description: 'Конвертация завершилась ошибкой' },
} as const;

/**
 * Zod-схема для статуса конвертации файла.
 * Используется в схемах API как тип поля `status` для файлов.
 */
export const fileStatusZodSchema = z
  .enum(FileStatusEnum)
  .describe('Статус конвертации файла');

/**
 * Расширенная JSON Schema для OpenAPI (`components.schemas.FileStatusEnum`).
 * Содержит значения enum, описания и varnames, используемые генераторами клиентов.
 */
export const FileStatusEnumSwaggerSchema = createEnumSchemaWithDescriptions(
  FileStatusEnum,
  FileStatusDescriptions,
  'FileStatusEnum',
  'Статус конвертации файла',
);
