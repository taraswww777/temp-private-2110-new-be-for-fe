/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { taskDetailSchema } from '../../../../schemas/report-6406/tasks.schema.ts';

import { idParamSchema } from '../../../../schemas/common/id.schema.ts';

/**
 * GET /api/v1/report-6406/tasks/:id
 * Получить детальную информацию о задании
 *
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const getTaskRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/:id', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Получить детальную информацию о задании',
      params: idParamSchema,
      response: {
        200: taskDetailSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
