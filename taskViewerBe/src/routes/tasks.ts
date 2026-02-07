import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  taskSchema,
  taskParamsSchema,
  updateTaskMetaSchema,
} from '../schemas/tasks.schema.js';
import { tasksService } from '../services/tasks.service.js';
import { tagsMetadataService, PREDEFINED_COLORS } from '../services/tags-metadata.service.js';

export const tasksRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/tasks - получить все задачи
  server.get(
    '/tasks',
    {
      schema: {
        description: 'Получить список всех задач',
        response: {
          200: z.array(taskSchema),
        },
      },
    },
    async (request, reply) => {
      const tasks = await tasksService.getAllTasks();
      return reply.send(tasks);
    }
  );

  // GET /api/tasks/:id - получить задачу с содержимым
  server.get(
    '/tasks/:id',
    {
      schema: {
        description: 'Получить задачу по ID с markdown содержимым',
        params: taskParamsSchema,
        response: {
          200: taskSchema.extend({
            content: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const task = await tasksService.getTaskById(id);

      if (!task) {
        return reply.status(404).send({ message: 'Task not found' });
      }

      return reply.send(task);
    }
  );

  // PATCH /api/tasks/:id - обновить метаданные задачи
  server.patch(
    '/tasks/:id',
    {
      schema: {
        description: 'Обновить метаданные задачи',
        params: taskParamsSchema,
        body: updateTaskMetaSchema,
        response: {
          200: taskSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      const task = await tasksService.updateTaskMeta(id, updates);

      if (!task) {
        return reply.status(404).send({ message: 'Task not found' });
      }

      // Если обновился статус, обновляем также markdown файл
      if (updates.status) {
        await tasksService.updateTaskStatusInMarkdown(task.file, updates.status);
      }

      return reply.send(task);
    }
  );

  // GET /api/tasks/tags/metadata — метаданные тегов (цвета)
  server.get(
    '/tasks/tags/metadata',
    {
      schema: {
        description: 'Получить метаданные тегов (цвет и др.)',
        response: {
          200: z.object({
            tags: z.record(z.string(), z.object({ color: z.string().optional() })),
            predefinedColors: z.array(z.string()),
          }),
        },
      },
    },
    async (_request, reply) => {
      const tags = await tagsMetadataService.getMetadata();
      return reply.send({
        tags,
        predefinedColors: [...PREDEFINED_COLORS],
      });
    }
  );

  // PATCH /api/tasks/tags/metadata — установить цвет тега
  server.patch(
    '/tasks/tags/metadata',
    {
      schema: {
        description: 'Установить цвет для тега',
        body: z.object({
          tag: z.string(),
          color: z.string(),
        }),
        response: {
          200: z.object({
            tags: z.record(z.string(), z.object({ color: z.string().optional() })),
          }),
        },
      },
    },
    async (request, reply) => {
      const { tag, color } = request.body;
      const tags = await tagsMetadataService.setTagColor(tag, color);
      return reply.send({ tags });
    }
  );

  // POST /api/tasks/tags/rename — переименовать тег во всех задачах
  server.post(
    '/tasks/tags/rename',
    {
      schema: {
        description: 'Переименовать тег во всех задачах',
        body: z.object({
          oldTag: z.string(),
          newTag: z.string(),
        }),
        response: {
          200: z.object({
            updated: z.number(),
          }),
        },
        400: z.object({ message: z.string() }),
      },
    },
    async (request, reply) => {
      const { oldTag, newTag } = request.body;
      const oldTrimmed = oldTag.trim();
      const newTrimmed = newTag.trim();
      if (!oldTrimmed || !newTrimmed) {
        return reply.status(400).send({ message: 'oldTag и newTag не должны быть пустыми' });
      }
      if (oldTrimmed === newTrimmed) {
        return reply.status(400).send({ message: 'Новое имя должно отличаться от старого' });
      }
      const updated = await tasksService.renameTagInAllTasks(oldTrimmed, newTrimmed);
      await tagsMetadataService.migrateTagMetadata(oldTrimmed, newTrimmed);
      return reply.send({ updated });
    }
  );
};
