import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventorizationInventoryStateQuerySchema,
  inventorizationInventoryStateResponseSchema,
} from '../../../schemas/inventorization/inventory-state.schema.ts';

export const inventorizationInventoryStateRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/state', {
    schema: {
      tags: ['Inventorization'],
      summary: 'Состояние процесса инвентаризации',
      querystring: inventorizationInventoryStateQuerySchema,
      response: { 200: inventorizationInventoryStateResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));
};
