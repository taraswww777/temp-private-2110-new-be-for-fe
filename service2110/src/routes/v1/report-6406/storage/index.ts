import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { storageService } from '../../../../services/report-6406/storage.service.js';
import { storageVolumeListResponseSchema } from '../../../../schemas/report-6406/storage.schema.js';

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/storage/volume
   * Получить массив хранилищ с объёмом (корзина 1, корзина 2, ТФР и т.д.)
   */
  app.get('/volume', {
    schema: {
      tags: ['Report 6406 - Storage'],
      summary: 'Получить объём хранилищ',
      description: 'Возвращает массив сущностей по одному на каждое хранилище (корзина 1, корзина 2, ТФР). Каждый элемент содержит id, name, code, totalHuman, freeHuman, percent для отображения и key в JSX.',
      response: {
        200: storageVolumeListResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await storageService.getStorageVolume();
    return reply.status(200).send(result);
  });
};
