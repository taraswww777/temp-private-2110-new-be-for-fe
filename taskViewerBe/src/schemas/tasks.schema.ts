import { z } from 'zod';

export const taskStatusEnum = z.enum(['backlog', 'planned', 'in-progress', 'completed', 'cancelled']);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatusEnum,
  file: z.string(),
  createdDate: z.string().nullable(),
  completedDate: z.string().nullable(),
  branch: z.string().nullable(),
});

export const taskManifestSchema = z.object({
  tasks: z.array(taskSchema),
});

export const updateTaskMetaSchema = z.object({
  title: z.string().optional(),
  status: taskStatusEnum.optional(),
  createdDate: z.string().nullable().optional(),
  completedDate: z.string().nullable().optional(),
  branch: z.string().nullable().optional(),
});

export const taskParamsSchema = z.object({
  id: z.string(),
});

export type TaskStatus = z.infer<typeof taskStatusEnum>;
export type UpdateTaskMetaInput = z.infer<typeof updateTaskMetaSchema>;
