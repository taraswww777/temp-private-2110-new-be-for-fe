import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { processResponseSchema, processRequestSchema } from '../../../../schemas/common/process.schema.ts';

/**
 * POST /api/v1/report-6406/tasks/cancel
 * Универсальная отмена заданий (одного или нескольких)
 * 
 * MOCK: Возвращает пустой результат для генерации Swagger-спецификации
 */
export const cancelTasksRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/cancel', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Отменить одно или несколько заданий',
      description: 'Отменяет задания на нашей стороне (переводит в статус «Задание отменено»). Синхронизация с внешней системой может в дальнейшем приводить к статусу KILLED_DAPP. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      body: processRequestSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ succeeded: 0, failed: 0, results: [] });
  });
};
