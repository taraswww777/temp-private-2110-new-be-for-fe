import type { FastifyPluginAsync } from 'fastify';
import { client } from '../db/index.ts';
import { healthResponseSchema, httpErrorWithInstanceSchema } from '../schemas/common.schema.ts';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /health - проверка состояния приложения
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        description: 'Проверка состояния приложения и подключения к БД',
        response: {
          200: healthResponseSchema,
          503: httpErrorWithInstanceSchema,
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
