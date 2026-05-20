/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getPackageListRequestSchema,
  packsListResponseSchema,
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
      summary: 'Поиск пакетов с фильтрацией',
      description: 'Возвращает список пакетов с применением фильтров, сортировки и пагинации',
      body: getPackageListRequestSchema,
      response: {
        200: packsListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
