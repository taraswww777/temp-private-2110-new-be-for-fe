/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createPackageSchema,
  packageSchema,
} from '../../../../schemas/report-6406/packages.schema';

/**
 * POST /api/v1/report-6406/packages
 * Создать новый пакет
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const createPackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Создать новый пакет',
      body: createPackageSchema,
      response: {
        201: packageSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(201).send({} as any);
  });
};
