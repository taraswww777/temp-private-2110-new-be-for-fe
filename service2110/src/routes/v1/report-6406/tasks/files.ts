/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  taskFilesQuerySchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from '../../../../schemas/report-6406/task-files.schema.ts';
import { idParamSchema, zIdSchema } from '../../../../schemas/common.schema.ts';

const taskFileParamsSchema = z.object({
  taskId: zIdSchema,
  fileId: zIdSchema,
});

export const filesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/tasks/:id/files
   * Получить список файлов задания
   * 
   * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
   */
  app.get('/:id/files', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить список файлов задания',
      description: 'Возвращает список файлов с pre-signed URLs для скачивания. URLs генерируются автоматически для файлов в статусе COMPLETED.',
      params: idParamSchema,
      querystring: taskFilesQuerySchema,
      response: {
        200: taskFilesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  /**
   * POST /api/v1/report-6406/tasks/:taskId/files/:fileId/retry
   * Повторить конвертацию файла с ошибкой (экспериментальный endpoint)
   * 
   * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
   */
  app.post('/:taskId/files/:fileId/retry', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: '⚠️ [Экспериментальный] Повторить конвертацию файла с ошибкой',
      description: 'Экспериментальная функция для повтора конвертации файлов. В текущей версии возвращает 501 Not Implemented.',
      params: taskFileParamsSchema,
      response: {
        200: retryFileConversionResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
