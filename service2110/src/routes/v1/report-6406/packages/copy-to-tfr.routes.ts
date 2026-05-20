/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  packTfrInfoSchema,
  packTransferRequestSchema,
} from '../../../../schemas/report-6406/packages.schema.ts';
import { idParamSchema } from '../../../../schemas/common/id.schema.ts';
import { z } from 'zod';

/**
 * TFR-операции с пакетами (mock для Swagger).
 */
export const tfrRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/transfer', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Передача пакетов в TFR',
      description: 'Передаёт указанные пакеты в систему TFR для дальнейшей обработки',
      body: packTransferRequestSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  app.post('/tfr-delete', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Удаление пакетов из TFR',
      description: 'Удаляет указанные пакеты из системы TFR',
      body: packTransferRequestSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });

  app.get('/info/tfr', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Получение информации о пакетах в TFR',
      description: 'Возвращает список пакетов, переданных в систему TFR',
      response: {
        200: z.array(packTfrInfoSchema),
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as any);
  });

  app.get('/{id}/cancel-copy', {
    schema: {
      tags: [OpenApiTag.Report6406Packages],
      summary: 'Отмена копирования пакета',
      description: 'Отменяет операцию копирования пакета в TFR',
      params: idParamSchema,
    },
  }, async (_request, reply) => {
    return reply.status(200).send({} as any);
  });
};
