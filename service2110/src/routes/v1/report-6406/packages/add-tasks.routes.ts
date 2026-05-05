/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { idListSchema } from '../../../../schemas/common/id.schema.ts';
import { processResponseSchema } from '../../../../schemas/common/process.schema.ts';
import { packageIdPathParamSchema } from '../../../../schemas/report-6406/packages.schema.ts';

/**
 * POST /api/v1/report-6406/packages/:packageId/tasks
 * Добавить задания в пакет
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const addTasksToPackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.patch('/:packageId/add-link-with-tasks', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Добавить задания в пакет',
      params: packageIdPathParamSchema,
      body: idListSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
