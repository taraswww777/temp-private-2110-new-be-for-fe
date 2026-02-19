import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { packagesService } from '../../../../services/report-6406/packages.service';
import { idParamSchema } from '../../../../schemas/common.schema';
import { packageStatusHistoryResponseSchema } from '../../../../schemas/report-6406/package-status-history.schema';

export const packageStatusHistoryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/packages/:id/status-history
   * Получить историю статусов пакета
   */
  app.get('/:id/status-history', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить историю статусов пакета',
      params: idParamSchema,
      response: {
        200: packageStatusHistoryResponseSchema,
        404: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'number' },
            detail: { type: 'string' },
            instance: { type: 'string' }
          }
        }
      },
    },
  }, async (request, reply) => {
    try {
      const history = await packagesService.getPackageStatusHistory(request.params.id);
      return reply.status(200).send(history);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: error.message,
          instance: `/api/v1/report-6406/packages/${request.params.id}/status-history`
        });
      }
      throw error;
    }
  });
};
