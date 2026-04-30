import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getTasksRequestSchema } from '../../../../schemas/report-6406/tasks.schema.ts';

export const exportRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/v1/report-6406/tasks/export
   * Выгрузить реестр отчётов в CSV формате
   */
  app.post('/export', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Выгрузить реестр отчётов в CSV формате',
      description: 'Создаёт CSV файл со списком заданий согласно фильтрам. Возвращает ссылку на скачивание файла.',
      body: getTasksRequestSchema,
      response: {
        200: z.file(),
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });
};
