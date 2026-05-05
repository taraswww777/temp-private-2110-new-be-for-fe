import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getTasksRequestSchema,
  tasksListResponseSchema,
} from '../../../../schemas/report-6406/tasks.schema.ts';

/**
 * POST /api/v1/report-6406/tasks/list
 * Получить список заданий с пагинацией, сортировкой и фильтрацией (body: pagination, sorting, filter).
 * Используется POST вместо GET, т.к. Fastify не поддерживает body для GET; структура запроса/ответа по TASK-011.
 * 
 * MOCK: Возвращает пустой список для генерации Swagger-спецификации
 */
export const listTasksRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Получить список заданий (пагинация, сортировка, фильтрация)',
      body: getTasksRequestSchema,
      response: {
        200: tasksListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ items: [], totalItems: 0 });
  });
};
