import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { exportTasksRequestSchema } from '../../../../schemas/report-6406/export.schema.ts';
import { z } from 'zod';

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
      body: exportTasksRequestSchema,
      response: {
        200: z.file(),
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as any);
  });
};
