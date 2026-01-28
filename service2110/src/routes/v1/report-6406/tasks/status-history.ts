import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { taskStatusHistoryService } from '../../../../services/report-6406/task-status-history.service.js';
import {
  statusHistoryQuerySchema,
  statusHistoryResponseSchema,
} from '../../../../schemas/report-6406/task-status-history.schema.js';
import { uuidParamSchema } from '../../../../schemas/common.schema.js';

export const statusHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/tasks/:id/status-history
   * Получить историю изменений статусов задания
   */
  app.get('/:id/status-history', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить историю изменений статусов задания',
      description: 'Возвращает полную историю всех изменений статусов задания с пагинацией',
      params: uuidParamSchema,
      querystring: statusHistoryQuerySchema,
      response: {
        200: statusHistoryResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await taskStatusHistoryService.getTaskStatusHistory(
        request.params.id,
        request.query
      );
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: error.message,
        });
      }
      throw error;
    }
  });
};
