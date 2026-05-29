import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';
import { inventoryFileSchema } from '../schemas/inventory/inventory-common.schema.ts';
import { OpenApiTag } from '../schemas/openapi-tags.ts';

export const inventoryFileRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/inventory/download', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Скачать файл',
      querystring: inventoryFileSchema,
      response: { 200: z.file() },
    },
  }, async (_request, reply) => reply.status(200).send({} as never));

  app.delete('/inventory/file', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Удалить файл',
      querystring: inventoryFileSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

app.post('/inventory/upload', {
  schema: {
    tags: [OpenApiTag.Inventory],
    summary: 'Загрузить файл',
    consumes: ['multipart/form-data'],
    body: z.object({
      request: inventoryFileSchema,
      file: z.any().describe('Файл задачи'),
    }),
    response: { 200: inventoryFileSchema },
  },
}, async (_request, reply) => reply.status(200).send({} as never));
};
