/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { idListSchema, idParamSchema } from '../../../../schemas/common/id.schema.ts';
import { processResponseSchema } from '../../../../schemas/common/process.schema.ts';

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
      tags: ['Report 6406 - Packages'],
      summary: 'Добавить задания в пакет',
      params: idParamSchema.extend({ packageId: idParamSchema.shape.id }).pick({ packageId: true }),
      body: idListSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
