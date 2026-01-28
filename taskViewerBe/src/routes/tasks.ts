import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  taskSchema,
  taskParamsSchema,
  updateTaskMetaSchema,
} from '../schemas/tasks.schema.js';
import { tasksService } from '../services/tasks.service.js';

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
};
