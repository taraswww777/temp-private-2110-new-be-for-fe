import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryColumnsResponseSchema,
  inventoryColumnsUpdateSchema,
  inventoryColumnsQuerySchema,
  inventoryInventoryStateQuerySchema,
  inventoryInventoryStateResponseSchema,
} from '../../../schemas/inventory/inventory-common.schema.ts';

export const inventoryCommonRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/state', {
    schema: {
      tags: ['Inventory'],
      summary: 'Статус процесса инвентаризации',
      querystring: inventoryInventoryStateQuerySchema,
      response: { 200: inventoryInventoryStateResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  
  app.get('/columns', {
    schema: {
      tags: ['Inventory'],
      summary: 'Колонки таблицы',
      querystring: inventoryColumnsQuerySchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.put('/columns', {
    schema: {
      tags: ['Inventory'],
      summary: 'Сохранить настройки колонок',
      body: inventoryColumnsUpdateSchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));
};
