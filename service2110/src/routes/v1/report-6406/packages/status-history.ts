import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { idParamSchema } from '../../../../schemas/common.schema';
import { packageStatusHistoryResponseSchema } from '../../../../schemas/report-6406/package-status-history.schema';

/**
 * GET /api/v1/report-6406/packages/:id/status-history
 * Получить историю статусов пакета
 * 
 * MOCK: Возвращает пустой массив для генерации Swagger-спецификации
 */
export const packageStatusHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/:id/status-history', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить историю статусов пакета',
      params: idParamSchema,
      response: {
        200: packageStatusHistoryResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([]);
  });
};
