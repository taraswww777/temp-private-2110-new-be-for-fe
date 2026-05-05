/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  retryFileConversionResponseSchema,
  taskFilePathParamsSchema,
  taskFilesQuerySchema,
  taskFilesResponseSchema,
  taskFileUrlResponseSchema,
} from '../../../../schemas/report-6406/task-files.schema.ts';
import { idParamSchema, zIdSchema } from '../../../../schemas/common/id.schema.ts';

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
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Получить список файлов задания',
      description: 'Возвращает список файлов без pre-signed URLs для скачивания.',
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
   * GET /api/v1/report-6406/tasks/files/presigned-urls
   * Получить список файлов задания
   *
   * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
   */
  app.post('/files/presigned-urls', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Получение presigned URL для скачивания файлов по их ID',
      description: 'Возвращает список pre-signed URLs для скачивания.',
      body: z.array(zIdSchema),
      response: {
        200: taskFileUrlResponseSchema,
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
      tags: [OpenApiTag.Report6406Tasks],
      summary: '⚠️ [Экспериментальный] Повторить конвертацию файла с ошибкой',
      description: 'Экспериментальная функция для повтора конвертации файлов. В текущей версии возвращает 501 Not Implemented.',
      params: taskFilePathParamsSchema,
      response: {
        200: retryFileConversionResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
