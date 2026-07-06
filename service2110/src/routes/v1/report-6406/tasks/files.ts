/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  taskFilesResponseSchema,
  taskFileUrlResponseSchema,
} from '../../../../schemas/report-6406/task-files.schema.ts';
import { idParamSchema, zIdSchema } from '../../../../schemas/common/id.schema.ts';
import { paginationQuerySchema } from '../../../../schemas/common/pagination.schema.ts';

export const filesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/v1/report-6406/tasks/:id/files
   * Получить список файлов задания с пагинацией
   *
   * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
   */
  app.post('/:id/files', {
    schema: {
      tags: [OpenApiTag.Report6406Tasks],
      summary: 'Получение файлов задачи с пагинацией',
      description: 'Возвращает список файлов задачи с поддержкой пагинации.',
      params: idParamSchema,
      body: paginationQuerySchema,
      response: {
        200: taskFilesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  /**
   * POST /api/v1/report-6406/tasks/files/presigned-urls
   * Получить presigned URL для скачивания файлов
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
};
