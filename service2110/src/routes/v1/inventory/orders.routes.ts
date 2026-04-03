import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createInventoryOrderSchema,
  inventoryOrderMutationResponseSchema,
  inventoryOrdersListResponseSchema,
  updateInventoryOrderSchema,
} from '../../../schemas/inventory/orders.schema.ts';

export const inventoryOrdersRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', {
    schema: {
      tags: ['Inventory - Orders'],
      summary: 'Список приказов инвентаризации',
      response: { 200: inventoryOrdersListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.post('/new', {
    schema: {
      tags: ['Inventory - Orders'],
      summary: 'Создать приказ инвентаризации',
      body: createInventoryOrderSchema,
      response: { 200: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ id: 1 }));

  app.post('/update', {
    schema: {
      tags: ['Inventory - Orders'],
      summary: 'Обновить приказ инвентаризации',
      body: updateInventoryOrderSchema,
      response: { 200: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ id: 1 }));
};
