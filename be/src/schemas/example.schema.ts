import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

export const itemParamsSchema = z.object({
  id: z.string().transform(Number),
});

export const itemResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemParams = z.infer<typeof itemParamsSchema>;
