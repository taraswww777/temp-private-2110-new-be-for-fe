/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  updatePackageSchema,
  updatePackageResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';
import { idParamSchema } from '../../../../schemas/common.schema';

/**
 * PATCH /api/v1/report-6406/packages/:id
 * Обновить название пакета
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const updatePackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.patch('/:id', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Обновить название пакета',
      params: idParamSchema,
      body: updatePackageSchema,
      response: {
        200: updatePackageResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
