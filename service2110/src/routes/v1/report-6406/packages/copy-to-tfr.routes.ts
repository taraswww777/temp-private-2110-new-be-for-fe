/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { copyToTfrResponseSchema, packageTfrResponseSchema } from '../../../../schemas/report-6406/packages.schema';

import { idListSchema, idParamSchema } from '../../../../schemas/common/id.schema.ts';
import { z } from 'zod';

/**
 * POST /api/v1/report-6406/packages/:packageId/copy-to-tfr
 * Скопировать пакет в ТФР
 * 
 * MOCK: Возвращает пустой объект для генерации Swagger-спецификации
 */
export const tfrRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/transfer', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Скопировать список пакетов на ТФР',
      body: idListSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  app.post('/{id}/cancel-copy', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Скопировать список пакетов на ТФР',
      params: idParamSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  app.delete('/tfr', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Удалить список пакетов на ТФР',
      body: idListSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });


  app.get('/tfr', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Получить список пакетов на ТФР',
      params: idParamSchema,
      response:{
        200: z.array(packageTfrResponseSchema)
      }
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
