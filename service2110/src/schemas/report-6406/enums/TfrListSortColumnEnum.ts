import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки списка TFR. */
export enum TfrListSortColumnEnum {
  ID = 'id',
  NAME = 'name',
  STATUS = 'status',
  SIZE = 'size',
  TOTAL_TASKS_COUNT = 'totalTasksCount',
  CREATED_AT = 'createdAt',
  CREATED_BY = 'createdBy',
  TFR_COPY_DATE = 'tfrCopyDate',
}

const TfrListSortColumnDescriptions = {
  [TfrListSortColumnEnum.ID]: { value: TfrListSortColumnEnum.ID, description: 'ИД TFR' },
  [TfrListSortColumnEnum.NAME]: { value: TfrListSortColumnEnum.NAME, description: 'Название TFR' },
  [TfrListSortColumnEnum.STATUS]: { value: TfrListSortColumnEnum.STATUS, description: 'Статус TFR' },
  [TfrListSortColumnEnum.SIZE]: { value: TfrListSortColumnEnum.SIZE, description: 'Размер TFR в мегабайтах' },
  [TfrListSortColumnEnum.TOTAL_TASKS_COUNT]: { value: TfrListSortColumnEnum.TOTAL_TASKS_COUNT, description: 'Общее количество заданий' },
  [TfrListSortColumnEnum.CREATED_AT]: { value: TfrListSortColumnEnum.CREATED_AT, description: 'Дата создания' },
  [TfrListSortColumnEnum.CREATED_BY]: { value: TfrListSortColumnEnum.CREATED_BY, description: 'Создатель TFR' },
  [TfrListSortColumnEnum.TFR_COPY_DATE]: { value: TfrListSortColumnEnum.TFR_COPY_DATE, description: 'Дата копирования в TFR' },
} as const;

export const tfrListSortColumnSchema = z
  .enum(TfrListSortColumnEnum)
  .describe('Колонка для сортировки списка TFR');

export const TfrListSortColumnEnumSchema = createEnumSchemaWithDescriptions(
  TfrListSortColumnEnum,
  TfrListSortColumnDescriptions,
  'TfrListSortColumnEnum',
  'Колонка для сортировки списка TFR',
);

(function registerTfrListSortColumnEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(tfrListSortColumnSchema, 'TfrListSortColumnEnum');
})();
