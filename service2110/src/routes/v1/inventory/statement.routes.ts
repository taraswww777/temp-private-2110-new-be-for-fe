import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { getInventoryStatementListRequestSchema, inventoryStatementListResponseSchema } from '../../../schemas/inventory/statement.schema.ts';

export const inventoryStatementRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Список счетов инвентаризации (пагинация, сортировка, фильтры)',
      body: getInventoryStatementListRequestSchema,
      response: { 200: inventoryStatementListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ itemsList: [], totalItems: 0 }));
};
