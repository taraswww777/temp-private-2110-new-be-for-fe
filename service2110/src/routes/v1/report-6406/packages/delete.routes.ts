/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { processResponseSchema } from '../../../../schemas/common/process.schema.ts';
import { idListSchema } from '../../../../schemas/common/id.schema.ts';

/**
 * POST /api/v1/report-6406/packages/delete/packages
 * Массовое удаление пакетов
 *
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const deletePackagesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/delete/packages', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Массовое удаление пакетов',
      description: 'Удаляет пакеты по списку идентификаторов. Возвращает детальную информацию о результате операции для каждого пакета.',
      body: idListSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
