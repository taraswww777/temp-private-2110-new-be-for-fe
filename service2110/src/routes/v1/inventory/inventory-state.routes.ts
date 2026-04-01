import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryInventoryStateQuerySchema,
  inventoryInventoryStateResponseSchema,
} from '../../../schemas/inventory/inventory-state.schema.ts';

export const inventoryInventoryStateRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/state', {
    schema: {
      tags: ['Inventory'],
      summary: 'Состояние процесса инвентаризации',
      querystring: inventoryInventoryStateQuerySchema,
      response: { 200: inventoryInventoryStateResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));
};
