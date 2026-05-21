import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки списка заданий. */
export enum TaskListSortColumnEnum {
  CREATED_AT = 'createdAt',
  TASK_STATUS = 'taskStatus',
  REPORT_TYPE = 'reportType',
  PERIOD_FROM = 'periodFrom',
  PERIOD_TO = 'periodTo',
  CREATED_BY = 'createdBy',
}

const TaskListSortColumnDescriptions = {
  [TaskListSortColumnEnum.CREATED_AT]: { value: TaskListSortColumnEnum.CREATED_AT, description: 'Дата создания' },
  [TaskListSortColumnEnum.TASK_STATUS]: { value: TaskListSortColumnEnum.TASK_STATUS, description: 'Статус задания' },
  [TaskListSortColumnEnum.REPORT_TYPE]: { value: TaskListSortColumnEnum.REPORT_TYPE, description: 'Тип отчёта' },
  [TaskListSortColumnEnum.PERIOD_FROM]: { value: TaskListSortColumnEnum.PERIOD_FROM, description: 'Начало отчётного периода' },
  [TaskListSortColumnEnum.PERIOD_TO]: { value: TaskListSortColumnEnum.PERIOD_TO, description: 'Конец отчётного периода' },
  [TaskListSortColumnEnum.CREATED_BY]: { value: TaskListSortColumnEnum.CREATED_BY, description: 'Автор задания' },
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
