import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  statusHistoryResponseSchema,
} from '../../../../schemas/report-6406/task-status-history.schema.ts';
import { idParamSchema } from '../../../../schemas/common.schema.ts';

/**
 * GET /api/v1/report-6406/tasks/:id/status-history
 * Получить полную историю изменений статусов задания
 * 
 * MOCK: Возвращает пустой массив для генерации Swagger-спецификации
 */
export const statusHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/:id/status-history', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить полную историю изменений статусов задания',
      description: 'Возвращает полную историю всех изменений статусов задания в виде простого массива (без пагинации)',
      params: idParamSchema,
      response: {
        200: statusHistoryResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([]);
  });
};
