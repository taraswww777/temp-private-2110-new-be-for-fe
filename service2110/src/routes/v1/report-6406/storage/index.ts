import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  s3BucketListResponseSchema,
  s3BucketPathParamSchema,
  storageVolumeListResponseSchema,
} from '../../../../schemas/report-6406/storage.schema.ts';

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/storages/volume
   * Получить информацию об объёме хранилищ
   */
  app.get('/volume', {
    schema: {
      tags: [OpenApiTag.Report6406Storage],
      summary: 'Получение информации о хранилищах',
      description: 'Возвращает информацию об объёме и свободном месте в хранилищах.',
      response: {
        200: storageVolumeListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });

  /**
   * GET /api/v1/report-6406/storages/s3/:bucket/list
   * Получить список файлов в S3 bucket (тестовый)
   */
  app.get('/s3/:bucket/list', {
    schema: {
      tags: [OpenApiTag.Report6406Storage],
      summary: 'Получение списка файлов в S3 (тестовый)',
      description: 'Возвращает список файлов в указанном bucket (только для тестирования).',
      params: s3BucketPathParamSchema,
      response: {
        200: s3BucketListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });
};
