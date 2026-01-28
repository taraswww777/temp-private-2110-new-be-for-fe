import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createItemSchema,
  updateItemSchema,
  itemParamsSchema,
  itemResponseSchema,
} from '../schemas/example.schema.js';
import { exampleService } from '../services/example.service.js';

export const exampleRoutes: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/items - получить все элементы
  server.get(
    '/items',
    {
      schema: {
        tags: ['Items'],
        description: 'Получить список всех элементов',
        response: {
          200: z.array(itemResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const items = await exampleService.getAll();
      return reply.send(items);
    }
  );

  // GET /api/v1/items/:id - получить элемент по ID
  server.get(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Получить элемент по ID',
        params: itemParamsSchema,
        response: {
          200: itemResponseSchema,
          404: z.object({ 
            type: z.string(),
            title: z.string(),
            status: z.number(),
            detail: z.string(),
            instance: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const item = await exampleService.getById(id);

      if (!item) {
        return reply.status(404).send({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Item not found',
          instance: request.url,
        });
      }

      return reply.send(item);
    }
  );

  // POST /api/v1/items - создать новый элемент
  server.post(
    '/items',
    {
      schema: {
        tags: ['Items'],
        description: 'Создать новый элемент',
        body: createItemSchema,
        response: {
          201: itemResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const item = await exampleService.create(request.body);
      return reply.status(201).send(item);
    }
  );

  // PATCH /api/v1/items/:id - обновить элемент
  server.patch(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Обновить элемент',
        params: itemParamsSchema,
        body: updateItemSchema,
        response: {
          200: itemResponseSchema,
          404: z.object({ 
            type: z.string(),
            title: z.string(),
            status: z.number(),
            detail: z.string(),
            instance: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const item = await exampleService.update(id, request.body);

      if (!item) {
        return reply.status(404).send({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Item not found',
          instance: request.url,
        });
      }

      return reply.send(item);
    }
  );

  // DELETE /api/v1/items/:id - удалить элемент
  server.delete(
    '/items/:id',
    {
      schema: {
        tags: ['Items'],
        description: 'Удалить элемент',
        params: itemParamsSchema,
        response: {
          204: z.void(),
          404: z.object({ 
            type: z.string(),
            title: z.string(),
            status: z.number(),
            detail: z.string(),
            instance: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = await exampleService.delete(id);

      if (!deleted) {
        return reply.status(404).send({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Item not found',
          instance: request.url,
        });
      }

      return reply.status(204).send();
    }
  );
};
