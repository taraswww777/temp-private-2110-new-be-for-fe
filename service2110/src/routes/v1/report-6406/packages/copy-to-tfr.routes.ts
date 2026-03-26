/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { copyToTfrResponseSchema } from '../../../../schemas/report-6406/packages.schema';

import { idParamSchema } from '../../../../schemas/common/id.schema.ts';

/**
 * POST /api/v1/report-6406/packages/:packageId/copy-to-tfr
 * Скопировать пакет в ТФР
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const copyToTfrRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/:packageId/copy-to-tfr', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Скопировать пакет в ТФР',
      params: idParamSchema.extend({ packageId: idParamSchema.shape.id }).pick({ packageId: true }),
      response: {
        200: copyToTfrResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
