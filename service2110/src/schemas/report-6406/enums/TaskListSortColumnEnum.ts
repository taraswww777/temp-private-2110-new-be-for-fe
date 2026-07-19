import { z } from 'zod';

import {
  createEnumSchemaWithDescriptions,
  EnumDescriptionValue,
} from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки списка заданий. */
export enum TaskListSortColumnEnum {
  ID = 'id',
  CREATED_AT = 'createdAt',
  PERIOD_FROM = 'periodFrom',
  PERIOD_TO = 'periodTo',
  STATUS = 'status',
  SIZE = 'size',
  FILE_TYPE = 'fileType',
  OPERATION_TYPE = 'operationType',
}

const TaskListSortColumnDescriptions: Record<TaskListSortColumnEnum, EnumDescriptionValue> = {
  [TaskListSortColumnEnum.ID]: { value: TaskListSortColumnEnum.ID, description: 'ИД Задания' },
  [TaskListSortColumnEnum.SIZE]: { value: TaskListSortColumnEnum.ID, description: 'Размер' },
  [TaskListSortColumnEnum.CREATED_AT]: { value: TaskListSortColumnEnum.CREATED_AT, description: 'Дата создания' },
  [TaskListSortColumnEnum.STATUS]: { value: TaskListSortColumnEnum.STATUS, description: 'Статус задания' },
  [TaskListSortColumnEnum.FILE_TYPE]: { value: TaskListSortColumnEnum.FILE_TYPE, description: 'Тип отчёта' },
  [TaskListSortColumnEnum.PERIOD_FROM]: { value: TaskListSortColumnEnum.PERIOD_FROM, description: 'Начало отчётного периода' },
  [TaskListSortColumnEnum.PERIOD_TO]: { value: TaskListSortColumnEnum.PERIOD_TO, description: 'Конец отчётного периода' },
  [TaskListSortColumnEnum.OPERATION_TYPE]: { value: TaskListSortColumnEnum.OPERATION_TYPE, description: 'Тип операции' },
} as const;

export const taskListSortColumnSchema = z
  .enum(TaskListSortColumnEnum)
  .describe('Колонка для сортировки списка заданий');

export const TaskListSortColumnEnumSchema = createEnumSchemaWithDescriptions(
  TaskListSortColumnEnum,
  TaskListSortColumnDescriptions,
  'TaskListSortColumnEnum',
  'Колонка для сортировки списка заданий',
);

(function registerTaskListSortColumnEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(taskListSortColumnSchema, 'TaskListSortColumnEnum');
})();
