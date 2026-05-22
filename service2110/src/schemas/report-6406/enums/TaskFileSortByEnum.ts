import { z } from 'zod';

import { createEnumSchemaWithDescriptions } from '../../utils/createEnumSchemaWithDescriptions.ts';
import { registerReport6406EnumOpenApiSchema } from '../openapi-register-helpers.ts';

/** Колонки сортировки файлов задания. */
export enum TaskFileSortByEnum {
  STATUS = 'status',
  FILE_NAME = 'fileName',
  FILE_SIZE = 'fileSize',
  CREATED_AT = 'createdAt',
}

const TaskFileSortByDescriptions = {
  [TaskFileSortByEnum.STATUS]: { value: TaskFileSortByEnum.STATUS, description: 'Статус файла' },
  [TaskFileSortByEnum.FILE_NAME]: { value: TaskFileSortByEnum.FILE_NAME, description: 'Имя файла' },
  [TaskFileSortByEnum.FILE_SIZE]: { value: TaskFileSortByEnum.FILE_SIZE, description: 'Размер файла' },
  [TaskFileSortByEnum.CREATED_AT]: { value: TaskFileSortByEnum.CREATED_AT, description: 'Дата создания' },
} as const;

export const taskFileSortBySchema = z
  .enum(TaskFileSortByEnum)
  .describe('Колонка для сортировки файлов задания');

export const TaskFileSortByEnumSchema = createEnumSchemaWithDescriptions(
  TaskFileSortByEnum,
  TaskFileSortByDescriptions,
  'TaskFileSortByEnum',
  'Колонка для сортировки файлов задания',
);

(function registerTaskFileSortByEnumOpenApi() {
  registerReport6406EnumOpenApiSchema(taskFileSortBySchema, 'TaskFileSortByEnum');
})();
