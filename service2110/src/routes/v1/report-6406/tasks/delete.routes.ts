import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  processTasksSchema,
  processTasksResponseSchema,
} from '../../../../schemas/report-6406/tasks.schema.ts';

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
      tags: ['Report 6406 - Tasks'],
      summary: 'Удалить одно или несколько заданий',
      description: 'Удаляет задания. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      body: processTasksSchema,
      response: {
        200: processTasksResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ succeeded: 0, failed: 0, results: [] });
  });
};
