import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  storageVolumeListResponseSchema,
  userRoleListResponseSchema,
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
   * GET /api/v1/report-6406/storages/user/roles
   * Получение информации о ролях пользователя
   */
  app.get('/user/roles', {
    schema: {
      tags: [OpenApiTag.Report6406Storage],
      summary: 'Получение информации о ролях пользователя',
      description: 'Возвращает информацию о ролях и назначениях пользователя.',
      response: {
        200: userRoleListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });
};
