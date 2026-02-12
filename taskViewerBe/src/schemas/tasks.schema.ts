import { z } from 'zod';

export const taskStatusEnum = z.enum(['backlog', 'planned', 'in-progress', 'completed', 'cancelled']);

export const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusEnum,
  priority: taskPriorityEnum.default('medium'),
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

export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type UpdateTaskMetaInput = z.infer<typeof updateTaskMetaSchema>;
