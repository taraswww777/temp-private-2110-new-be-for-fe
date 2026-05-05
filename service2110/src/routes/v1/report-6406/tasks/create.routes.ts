/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createTaskSchema,
  taskDetailSchema,
} from '../../../../schemas/report-6406/tasks.schema.ts';

/**
 * POST /api/v1/report-6406/tasks
 * Создать новое задание на построение отчёта
 *
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const createTaskRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Создать новое задание на построение отчёта',
      body: createTaskSchema,
      response: {
        201: taskDetailSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(201).send({} as any);
  });
};
