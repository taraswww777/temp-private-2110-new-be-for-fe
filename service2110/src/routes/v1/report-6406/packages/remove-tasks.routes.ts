/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';

import { idListSchema } from '../../../../schemas/common/id.schema.ts';
import { processResponseSchema } from '../../../../schemas/common/process.schema.ts';
import { packageIdPathParamSchema } from '../../../../schemas/report-6406/packages.schema.ts';

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
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Удалить одно или несколько заданий из пакета',
      description: 'Удаляет задания из пакета. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
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
