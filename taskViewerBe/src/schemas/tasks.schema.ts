import { z } from 'zod';
import { TaskStatusEnum } from '../types/taskStatusEnum.js';
import { TaskPriorityEnum } from '../types/taskPriorityEnum.js';

export const taskStatusEnum = z.enum([
  TaskStatusEnum.backlog,
  TaskStatusEnum.planned,
  TaskStatusEnum.inProgress,
  TaskStatusEnum.completed,
  TaskStatusEnum.cancelled
]);

export const taskPriorityEnum = z.enum([
  TaskPriorityEnum.low,
  TaskPriorityEnum.medium,
  TaskPriorityEnum.high,
  TaskPriorityEnum.critical
]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusEnum,
  priority: taskPriorityEnum.default(TaskPriorityEnum.medium),
  file: z.string(),
  createdDate: z.string().nullable(),
  completedDate: z.string().nullable(),
  branch: z.string().nullable(),
  youtrackIssueIds: z.array(z.string()).optional(), // Опциональное поле для связей с YouTrack
  tags: z.array(z.string()).optional(), // Теги задачи (при создании в YouTrack фильтруются по чёрному списку)
  project: z.string().nullable().optional(), // Имя проекта (в API и ответах; в манифесте хранится projectId)
});

export const taskManifestSchema = z.object({
  tasks: z.array(taskSchema),
});

export const updateTaskMetaSchema = z.object({
  title: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  createdDate: z.string().nullable().optional(),
  completedDate: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  project: z.string().nullable().optional(), // Имя проекта (резолвится в projectId при сохранении)
});

export const taskParamsSchema = z.object({
  id: z.string(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  status: taskStatusEnum.default('backlog'),
  priority: taskPriorityEnum.default('medium'),
  content: z.string().default(''),
  createdDate: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  project: z.string().nullable().optional(),
});

export const updateTaskContentSchema = z.object({
  content: z.string(),
});

export type TaskStatus = TaskStatusEnum;
export type TaskStatus = TaskStatusEnum;
export type TaskPriority = TaskPriorityEnum;
export type UpdateTaskMetaInput = z.infer<typeof updateTaskMetaSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskContentInput = z.infer<typeof updateTaskContentSchema>;
