/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getPackageListRequestSchema,
  getPackageListResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';

/**
 * GET /api/v1/report-6406/packages
 * Получить список пакетов с пагинацией
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const listPackagesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Получить список пакетов с пагинацией',
      body: getPackageListRequestSchema,
      response: {
        200: getPackageListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
