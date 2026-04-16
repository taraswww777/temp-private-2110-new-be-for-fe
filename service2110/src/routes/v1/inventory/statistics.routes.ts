import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryStatisticsExportRequestSchema,
  inventoryStatisticsExportResponseSchema,
} from '../../../schemas/inventory/statistics.schema.ts';
import z from 'zod';

export const inventoryStatisticsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/export', {
    schema: {
      tags: ['Inventory - Statistics'],
      summary: 'Запрос списка сформированных статистик',
      response: { 200: inventoryStatisticsExportResponseSchema },
    },
  }, async (_request, reply) =>
    reply.status(200).send([]));

  app.post('/export', {
    schema: {
      tags: ['Inventory - Statistics'],
      summary: 'Экспорт статистики инвентаризации',
      body: inventoryStatisticsExportRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));
};
