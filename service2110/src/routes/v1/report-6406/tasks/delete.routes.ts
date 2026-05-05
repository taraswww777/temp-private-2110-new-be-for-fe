import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { processResponseSchema, processRequestSchema } from '../../../../schemas/common/process.schema.ts';

/**
 * DELETE /api/v1/report-6406/tasks
 * Универсальное удаление заданий (одного или нескольких)
 * 
 * MOCK: Возвращает пустой результат для генерации Swagger-спецификации
 */
export const deleteTasksRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.delete('/', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Удалить одно или несколько заданий',
      description: 'Удаляет задания. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      body: processRequestSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ succeeded: 0, failed: 0, results: [] });
  });
};
