import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createPackageSchema, Package,
  packageSchema,
} from '../../../../schemas/report-6406/packages.schema';
import { zErrorDTOSchema } from '../../../../schemas/common/errorDTO.schema.ts';


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
        409: zErrorDTOSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(201).send({} as Package);
  });
};
