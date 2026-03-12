import { z } from 'zod';
import { createEnumSchemaWithDescriptions } from '../utils/createEnumSchemaWithDescriptions';

/**
 * Код хранилища.
 *
 * Определяет тип хранилища для файлов отчётов:
 * - TFR — Территориальный финансовый репозиторий;
 * - S3 — объектное хранилище (S3-совместимое);
 * - LOCAL — локальное хранилище на сервере.
 */
export enum StorageCodeEnum {
  /** Территориальный финансовый репозиторий. */
  TFR = 'TFR',

  /** Объектное хранилище (S3-совместимое). */
  S3 = 'S3',

  /** Локальное хранилище на сервере. */
  LOCAL = 'LOCAL',
}

/**
 * Мапа описаний для каждого значения `StorageCodeEnum`.
 * Используется для генерации расширенной OpenAPI-схемы с `x-enum-*` метаданными.
 */
const StorageCodeDescriptions = {
  [StorageCodeEnum.TFR]:   { value: StorageCodeEnum.TFR,   description: 'Территориальный финансовый репозиторий' },
  [StorageCodeEnum.S3]:    { value: StorageCodeEnum.S3,    description: 'Объектное хранилище (S3)' },
  [StorageCodeEnum.LOCAL]: { value: StorageCodeEnum.LOCAL, description: 'Локальное хранилище' },
} as const;

/**
 * Zod-схема для кода хранилища.
 * Используется в схемах API как тип поля `code` для хранилищ.
 */
export const storageCodeZodSchema = z
  .enum(StorageCodeEnum)
  .describe('Код хранилища');

/**
 * Расширенная JSON Schema для OpenAPI (`components.schemas.StorageCodeEnum`).
 * Содержит значения enum, описания и varnames, используемые генераторами клиентов.
 */
export const StorageCodeEnumSwaggerSchema = createEnumSchemaWithDescriptions(
  StorageCodeEnum,
  StorageCodeDescriptions,
  'StorageCodeEnum',
  'Код хранилища',
);
