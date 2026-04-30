/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { idListSchema, idParamSchema } from '../../../../schemas/common/id.schema.ts';
import { processResponseSchema } from '../../../../schemas/common/process.schema.ts';

/**
 * DELETE /api/v1/report-6406/packages/:packageId/tasks
 * Универсальное удаление заданий из пакета (одного или нескольких)
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const removeTasksFromPackageRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.delete('/:packageId/delete-link-with-tasks', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Удалить одно или несколько заданий из пакета',
      description: 'Удаляет задания из пакета. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
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
