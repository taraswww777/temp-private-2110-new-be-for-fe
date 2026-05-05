import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryColumnsResponseSchema,
  inventoryColumnsUpdateSchema,
  inventoryColumnsQuerySchema,
  inventoryInventoryStateQuerySchema,
  inventoryInventoryStateResponseSchema,
  inventoryActiveStateSchema,
} from '../../../schemas/inventory/inventory-common.schema.ts';
import z from 'zod';

export const inventoryCommonRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/state', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Статус процесса инвентаризации',
      querystring: inventoryInventoryStateQuerySchema,
      response: { 200: inventoryInventoryStateResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  
  app.get('/columns', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Колонки таблицы',
      querystring: inventoryColumnsQuerySchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.put('/columns', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Сохранить настройки колонок',
      body: inventoryColumnsUpdateSchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

    app.put('/inventory-active', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Запрос изменения активности инвентаризации',
      body: inventoryActiveStateSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));
};
