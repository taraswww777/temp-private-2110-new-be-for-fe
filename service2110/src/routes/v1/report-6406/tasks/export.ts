import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getTasksRequestSchema } from '../../../../schemas/report-6406/tasks.schema.ts';

/**
 * POST /api/v1/file/report-6406/tasks/export
 * Экспортирует список задач в формате Excel с применением фильтров
 */
export const fileExportRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/export', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Экспортирует список задач в формате Excel с применением фильтров',
      body: getTasksRequestSchema,
      response: {
        200: z.file(),
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as never);
  });

  // app.post('/:id/account-file', {
  //   schema: {
  //     tags: [OpenApiTag.Report6406Tasks],
  //     summary: 'Загрузка файла со счетами',
  //     consumes: ['multipart/form-data'],
  //     body: z.object({
  //       file: z.any().describe('Файл со счетами'),
  //     }),
  //     response: { 200: z.null() },
  //   },
  // }, async (_request, reply) => {
  //   return reply.status(200).send({} as never);
  // });
};
