import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';

// Enum для статусов пакета
export enum PackageStatusEnum {
  /** Создано */
  CREATE = 'pack_create',
  /** Копирование */
  TRANSFER = 'pack_transfer',
  /** Выполнено */
  DONE = 'pack_done',
  /** Не выполнено */
  FAIL = 'pack_fail',
  /** Отменено */
  CANCEL = 'pack_cancel',
  /** Удалено */
  DELETE = 'pack_delete',
}

// Мапа описаний для каждого значения enum
const PackageStatusDescriptions = {
  [PackageStatusEnum.CREATE]: { value: PackageStatusEnum.CREATE, description: 'Создано' },
  [PackageStatusEnum.TRANSFER]: { value: PackageStatusEnum.TRANSFER, description: 'Копирование' },
  [PackageStatusEnum.DONE]: { value: PackageStatusEnum.DONE, description: 'Выполнено' },
  [PackageStatusEnum.FAIL]: { value: PackageStatusEnum.FAIL, description: 'Не выполнено' },
  [PackageStatusEnum.CANCEL]: { value: PackageStatusEnum.CANCEL, description: 'Отменено' },
  [PackageStatusEnum.DELETE]: { value: PackageStatusEnum.DELETE, description: 'Удалено' },
} as const;

// Создаем схему через enum (который возвращает ZodEnum)
export const packageStatusSchema = z.enum(PackageStatusEnum).describe('Статус пакета');

// Добавляем метаданные через describe (некоторые генераторы поддерживают)
export const PackageStatusEnumSchema = createEnumSchemaWithDescriptions(
  PackageStatusEnum,
  PackageStatusDescriptions,
  'PackageStatusEnum',
  'Статус пакета',
);
