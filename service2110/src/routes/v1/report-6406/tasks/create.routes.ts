/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createTaskSchema,
  taskDetailSchema,
} from '../../../../schemas/report-6406/tasks.schema.ts';
import { idListSchema } from '../../../../schemas/common/id.schema.ts';

/**
 * POST /api/v1/report-6406/tasks/create
 * Создаёт новую задачу
 */
export const createTaskRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/create', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Создаёт новую задачу',
      body: createTaskSchema,
      response: {
        201: idListSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(201).send({} as any);
  });
};

/**
 * POST /api/v1/file/report-6406/tasks
 * Создаёт новую задачу с возможностью прикрепления файла
 */
export const fileCreateTaskRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Создаёт новую задачу с возможностью прикрепления файла',
      body: createTaskSchema,
      response: {
        201: taskDetailSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(201).send({} as any);
  });
};
