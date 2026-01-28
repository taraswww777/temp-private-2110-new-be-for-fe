import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { exportService } from '../../../../services/report-6406/export.service.js';
import {
  exportTasksRequestSchema,
  exportTasksResponseSchema,
} from '../../../../schemas/report-6406/export.schema.js';

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
        200: exportTasksResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await exportService.exportTasks(request.body);
    return reply.status(200).send(result);
  });
};
