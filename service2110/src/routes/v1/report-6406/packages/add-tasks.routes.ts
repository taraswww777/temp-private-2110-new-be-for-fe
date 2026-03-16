/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  addTasksToPackageSchema,
  addTasksToPackageResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';
import { idParamSchema } from '../../../../schemas/common.schema';

/**
 * POST /api/v1/report-6406/packages/:packageId/tasks
 * Добавить задания в пакет
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const addTasksToPackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/:packageId/tasks', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Добавить задания в пакет',
      params: idParamSchema.extend({ packageId: idParamSchema.shape.id }).pick({ packageId: true }),
      body: addTasksToPackageSchema,
      response: {
        200: addTasksToPackageResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
