import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки списка пакетов. */
export enum PackageListSortColumnEnum {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  TASKS_COUNT = 'tasksCount',
  TOTAL_SIZE = 'totalSize',
}

const PackageListSortColumnDescriptions = {
  [PackageListSortColumnEnum.CREATED_AT]: { value: PackageListSortColumnEnum.CREATED_AT, description: 'Дата создания' },
  [PackageListSortColumnEnum.NAME]: { value: PackageListSortColumnEnum.NAME, description: 'Название пакета' },
  [PackageListSortColumnEnum.TASKS_COUNT]: { value: PackageListSortColumnEnum.TASKS_COUNT, description: 'Количество заданий' },
  [PackageListSortColumnEnum.TOTAL_SIZE]: { value: PackageListSortColumnEnum.TOTAL_SIZE, description: 'Общий размер' },
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
