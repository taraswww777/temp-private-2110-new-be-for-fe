import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
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
      tags: [OpenApiTag.InventoryOrders],
      summary: 'Список приказов инвентаризации',
      response: { 200: inventoryOrdersListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.post('/', {
    schema: {
      tags: [OpenApiTag.InventoryOrders],
      summary: 'Создать приказ инвентаризации',
      body: createInventoryOrderSchema,
      response: { 201: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(201).send({ inventoryOrderId: String(1) }));

  app.put('/', {
    schema: {
      tags: [OpenApiTag.InventoryOrders],
      summary: 'Обновить приказ инвентаризации',
      body: updateInventoryOrderSchema,
      response: { 200: inventoryOrderMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ inventoryOrderId: String(1) }));
};
