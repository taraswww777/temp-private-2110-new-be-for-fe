import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createInventoryOrderSchema,
  getInventoryOrdersListRequestSchema,
  inventoryOrderMutationResponseSchema,
  inventoryOrdersListResponseSchema,
  updateInventoryOrderSchema,
} from '../../../schemas/inventory/orders.schema.ts';

export const inventoryOrdersRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: ['Inventory'],
      summary: 'Список приказов инвентаризации (пагинация, сортировка)',
      body: getInventoryOrdersListRequestSchema,
      response: { 200: inventoryOrdersListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [], totalItems: 0 }));

  app.post('/new', {
    schema: {
      tags: ['Inventory'],
      summary: 'Создать приказ инвентаризации',
      body: createInventoryOrderSchema,
      response: { 200: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ id: 1 }));

  app.post('/update', {
    schema: {
      tags: ['Inventory'],
      summary: 'Обновить приказ инвентаризации',
      body: updateInventoryOrderSchema,
      response: { 200: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ id: 1 }));
};
