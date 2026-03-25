import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventorizationStatisticsExportRequestSchema,
  inventorizationStatisticsExportResponseSchema,
} from '../../../schemas/inventorization/statistics.schema.ts';

export const inventorizationStatisticsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/export', {
    schema: {
      tags: ['Inventorization - Statistics'],
      summary: 'Экспорт статистики инвентаризации',
      body: inventorizationStatisticsExportRequestSchema,
      response: { 200: inventorizationStatisticsExportResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));
};
