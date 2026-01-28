import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { storageService } from '../../../../services/report-6406/storage.service.js';
import { storageVolumeResponseSchema } from '../../../../schemas/report-6406/storage.schema.js';

export const storageRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/storage/volume
   * Получить информацию о занятом и свободном объёме хранилища
   */
  app.get('/volume', {
    schema: {
      tags: ['Report 6406 - Storage'],
      summary: 'Получить информацию о объёме хранилища',
      description: 'Возвращает информацию о общем, занятом и свободном объёме хранилища. Включает предупреждение при превышении порога заполнения.',
      response: {
        200: storageVolumeResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await storageService.getStorageVolume();
    return reply.status(200).send(result);
  });
};
