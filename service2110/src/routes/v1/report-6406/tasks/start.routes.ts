import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { processResponseSchema, processRequestSchema } from '../../../../schemas/common/process.schema.ts';

/**
 * POST /api/v1/report-6406/tasks/start
 * Запустить одно или несколько заданий на выполнение
 * 
 * MOCK: Возвращает пустой результат для генерации Swagger-спецификации
 */
export const startTasksRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/start', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Запустить задания на выполнение (переводит из статуса created в started)',
      description: 'Запускает задания на генерацию отчётов. Проверяет наличие свободного места в хранилище. Поддерживает запуск одного или нескольких заданий.',
      body: processRequestSchema,
      response: {
        200: processResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ succeeded: 0, failed: 0, results: [] });
  });
};
