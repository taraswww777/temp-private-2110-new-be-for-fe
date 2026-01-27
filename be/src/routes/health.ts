import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { client } from '../db/index.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /health - проверка состояния приложения
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        description: 'Проверка состояния приложения и подключения к БД',
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.string(),
            database: z.string(),
          }),
          503: z.object({
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
      try {
        // Проверка подключения к БД
        await client`SELECT 1`;

        return reply.status(200).send({
          status: 'OK',
          timestamp: new Date().toISOString(),
          database: 'connected',
        });
      } catch (error) {
        fastify.log.error({ error }, 'Health check failed');
        return reply.status(503).send({
          type: 'https://httpstatuses.com/503',
          title: 'Service Unavailable',
          status: 503,
          detail: 'Database connection failed',
          instance: request.url,
        });
      }
    }
  );
};
