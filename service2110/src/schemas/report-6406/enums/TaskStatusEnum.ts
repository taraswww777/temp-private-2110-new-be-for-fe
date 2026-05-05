import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/**
 * Статусы задания (локальная статусная модель task_*)
 */
export enum TaskStatusEnum {
  /** Создано */
  CREATE = 'task_create',
  /** Готовится к запуску */
  LOADING = 'task_loading',
  /** Выборка данных */
  DATA = 'task_data',
  /** Нет данных по заданным параметрам */
  EMPTY_DATA = 'task_empty_data',
  /** Выборка не выполнена */
  FAIL_DATA = 'task_fail_data',
  /** Выборка данных отменена */
  CANCEL_DATA = 'task_cancel_data',
  /** Генерация */
  CONVERSION = 'task_conversion',
  /** Выполнено */
  DONE = 'task_done',
  /** Генерация не выполнена */
  FAIL_GENERATION = 'task_fail_generation',
  /** Генерация отменена */
  CANCEL_GENERATION = 'task_cancel_generation',
  /** Удалено */
  DELETE = 'task_delete',
}

const TaskStatusDescriptions = {
  [TaskStatusEnum.CREATE]: { value: TaskStatusEnum.CREATE, description: 'Создано' },
  [TaskStatusEnum.LOADING]: { value: TaskStatusEnum.LOADING, description: 'Готовится к запуску' },
  [TaskStatusEnum.DATA]: { value: TaskStatusEnum.DATA, description: 'Выборка данных' },
  [TaskStatusEnum.EMPTY_DATA]: { value: TaskStatusEnum.EMPTY_DATA, description: 'Нет данных по заданным параметрам' },
  [TaskStatusEnum.FAIL_DATA]: { value: TaskStatusEnum.FAIL_DATA, description: 'Выборка не выполнена' },
  [TaskStatusEnum.CANCEL_DATA]: { value: TaskStatusEnum.CANCEL_DATA, description: 'Выборка данных отменена' },
  [TaskStatusEnum.CONVERSION]: { value: TaskStatusEnum.CONVERSION, description: 'Генерация' },
  [TaskStatusEnum.DONE]: { value: TaskStatusEnum.DONE, description: 'Выполнено' },
  [TaskStatusEnum.FAIL_GENERATION]: { value: TaskStatusEnum.FAIL_GENERATION, description: 'Генерация не выполнена' },
  [TaskStatusEnum.CANCEL_GENERATION]: { value: TaskStatusEnum.CANCEL_GENERATION, description: 'Генерация отменена' },
  [TaskStatusEnum.DELETE]: { value: TaskStatusEnum.DELETE, description: 'Удалено' },
} as const;

export const taskStatusSchema = z.enum(TaskStatusEnum).describe('Статус задания (локальная модель task_*)');

export const TaskStatusEnumSchema = createEnumSchemaWithDescriptions(
  TaskStatusEnum,
  TaskStatusDescriptions,
  'TaskStatusEnum',
  'Статус задания',
);

(function registerTaskStatusEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(taskStatusSchema, 'TaskStatusEnum');
})();
