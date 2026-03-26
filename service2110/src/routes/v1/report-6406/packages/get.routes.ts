/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { packageSchema } from '../../../../schemas/report-6406/packages.schema';

import { idParamSchema } from '../../../../schemas/common/id.schema.ts';

/**
 * GET /api/v1/report-6406/packages/:id
 * Получить детальную информацию о пакете
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const getPackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/:id', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить детальную информацию о пакете',
      params: idParamSchema,
      response: {
        200: packageSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
