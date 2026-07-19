import { z } from 'zod';

import {
  createEnumSchemaWithDescriptions,
  EnumDescriptionValue,
} from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки списка пакетов. */
export enum PackageListSortColumnEnum {
  ID = 'id',
  NAME = 'name',
  STATUS = 'status',
  SIZE = 'size',
  TOTAL_TASKS_COUNT = 'totalTasksCount',
  CREATED_AT = 'createdAt',
  CREATED_BY = 'createdBy',
  TFR_COPY_DATE = 'tfrCopyDate',
}

const PackageListSortColumnDescriptions: Record<PackageListSortColumnEnum, EnumDescriptionValue> = {
  [PackageListSortColumnEnum.ID]: { value: PackageListSortColumnEnum.ID, description: 'ИД пакета' },
  [PackageListSortColumnEnum.NAME]: { value: PackageListSortColumnEnum.NAME, description: 'Название пакета' },
  [PackageListSortColumnEnum.STATUS]: { value: PackageListSortColumnEnum.STATUS, description: 'Статус пакета' },
  [PackageListSortColumnEnum.SIZE]: { value: PackageListSortColumnEnum.SIZE, description: 'Размер' },
  [PackageListSortColumnEnum.TOTAL_TASKS_COUNT]: { value: PackageListSortColumnEnum.TOTAL_TASKS_COUNT, description: 'Количество заданий' },
  [PackageListSortColumnEnum.CREATED_AT]: { value: PackageListSortColumnEnum.CREATED_AT, description: 'Дата создания' },
  [PackageListSortColumnEnum.CREATED_BY]: { value: PackageListSortColumnEnum.CREATED_BY, description: 'Создатель' },
  [PackageListSortColumnEnum.TFR_COPY_DATE]: { value: PackageListSortColumnEnum.TFR_COPY_DATE, description: 'Дата копирования TFR' },
} as const;

export const packageListSortColumnSchema = z
  .enum(PackageListSortColumnEnum)
  .describe('Колонка для сортировки списка пакетов');

export const PackageListSortColumnEnumSchema = createEnumSchemaWithDescriptions(
  PackageListSortColumnEnum,
  PackageListSortColumnDescriptions,
  'PackageListSortColumnEnum',
  'Колонка для сортировки списка пакетов',
);

(function registerPackageListSortColumnEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(packageListSortColumnSchema, 'PackageListSortColumnEnum');
})();
