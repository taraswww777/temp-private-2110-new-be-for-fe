import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getPackageListRequestSchema,
  getPackageListResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';

/**
 * POST /api/v1/report-6406/packages/list
 * Поиск пакетов с фильтрацией
 *
 * MOCK: Возвращает пустой список для генерации Swagger-спецификации
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
        200: getPackageListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ results: [], totalItems: 0 });
  });
};
