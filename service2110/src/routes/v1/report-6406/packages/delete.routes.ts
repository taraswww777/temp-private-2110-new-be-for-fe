/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  bulkDeletePackagesSchema,
  bulkDeletePackagesResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';

/**
 * DELETE /api/v1/report-6406/packages
 * Универсальное удаление пакетов (одного или нескольких)
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const deletePackagesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.delete('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Удалить один или несколько пакетов',
      description: 'Удаляет пакеты. Возвращает 200 OK с детальной информацией о результате операции для каждого пакета.',
      body: bulkDeletePackagesSchema,
      response: {
        200: bulkDeletePackagesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
