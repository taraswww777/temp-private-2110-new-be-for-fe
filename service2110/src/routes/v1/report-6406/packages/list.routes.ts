/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  packagesQuerySchema,
  packagesListResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';

/**
 * GET /api/v1/report-6406/packages
 * Получить список пакетов с пагинацией
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const listPackagesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить список пакетов с пагинацией',
      querystring: packagesQuerySchema,
      response: {
        200: packagesListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
