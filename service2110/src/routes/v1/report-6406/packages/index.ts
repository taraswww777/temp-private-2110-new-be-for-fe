import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { packagesService } from '../../../../services/report-6406/packages.service.js';
import {
  createPackageSchema,
  updatePackageSchema,
  packagesQuerySchema,
  packagesListResponseSchema,
  packageDetailSchema,
  packageSchema,
  updatePackageResponseSchema,
  bulkDeletePackagesSchema,
  bulkDeletePackagesResponseSchema,
  packageTasksQuerySchema,
  addTasksToPackageSchema,
  addTasksToPackageResponseSchema,
  bulkRemoveTasksFromPackageSchema,
  bulkRemoveTasksResponseSchema,
  copyToTfrResponseSchema,
} from '../../../../schemas/report-6406/packages.schema';
import { uuidParamSchema } from '../../../../schemas/common.schema';

export const packagesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/v1/report-6406/packages
   * Создать новый пакет
   */
  app.post('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Создать новый пакет',
      body: createPackageSchema,
      response: {
        201: packageSchema,
      },
    },
  }, async (request, reply) => {
    const pkg = await packagesService.createPackage(request.body);
    return reply.status(201).send(pkg);
  });

  /**
   * GET /api/v1/report-6406/packages
   * Получить список пакетов с пагинацией
   */
  app.get('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить список пакетов с пагинацией',
      querystring: packagesQuerySchema,
      response: {
        200: packagesListResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await packagesService.getPackages(request.query);
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/packages/:id
   * Получить детальную информацию о пакете с заданиями
   */
  app.get('/:id', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Получить детальную информацию о пакете с заданиями',
      params: uuidParamSchema,
      querystring: packageTasksQuerySchema,
      response: {
        200: packageDetailSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const pkg = await packagesService.getPackageById(request.params.id, request.query);
      return reply.status(200).send(pkg);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: error.message,
        });
      }
      throw error;
    }
  });

  /**
   * PATCH /api/v1/report-6406/packages/:id
   * Обновить название пакета
   */
  app.patch('/:id', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Обновить название пакета',
      params: uuidParamSchema,
      body: updatePackageSchema,
      response: {
        200: updatePackageResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await packagesService.updatePackage(request.params.id, request.body);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: error.message,
        });
      }
      throw error;
    }
  });

  /**
   * DELETE /api/v1/report-6406/packages
   * Универсальное удаление пакетов (одного или нескольких)
   */
  app.delete('/', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Удалить один или несколько пакетов',
      description: 'Удаляет пакеты. Возвращает 200 OK с детальной информацией о результате операции для каждого пакета.',
      body: bulkDeletePackagesSchema,
      response: {
        200: bulkDeletePackagesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await packagesService.bulkDeletePackages(request.body);
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/report-6406/packages/:packageId/tasks
   * Добавить задания в пакет
   */
  app.post('/:packageId/tasks', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Добавить задания в пакет',
      params: uuidParamSchema.extend({ packageId: uuidParamSchema.shape.id }).pick({ packageId: true }),
      body: addTasksToPackageSchema,
      response: {
        200: addTasksToPackageResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await packagesService.addTasksToPackage(request.params.packageId, request.body);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(404).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
          detail: error.message,
        });
      }
      throw error;
    }
  });

  /**
   * DELETE /api/v1/report-6406/packages/:packageId/tasks
   * Универсальное удаление заданий из пакета (одного или нескольких)
   */
  app.delete('/:packageId/tasks', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Удалить одно или несколько заданий из пакета',
      description: 'Удаляет задания из пакета. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      params: uuidParamSchema.extend({ packageId: uuidParamSchema.shape.id }).pick({ packageId: true }),
      body: bulkRemoveTasksFromPackageSchema,
      response: {
        200: bulkRemoveTasksResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await packagesService.bulkRemoveTasksFromPackage(request.params.packageId, request.body);
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/report-6406/packages/:packageId/copy-to-tfr
   * Скопировать пакет в ТФР
   */
  app.post('/:packageId/copy-to-tfr', {
    schema: {
      tags: ['Report 6406 - Packages'],
      summary: 'Скопировать пакет в ТФР',
      params: uuidParamSchema.extend({ packageId: uuidParamSchema.shape.id }).pick({ packageId: true }),
      response: {
        200: copyToTfrResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await packagesService.copyToTfr(request.params.packageId);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
            title: 'Not Found',
            status: 404,
            detail: error.message,
          });
        }
        if (error.message.includes('Cannot copy empty package')) {
          return reply.status(400).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Bad Request',
            status: 400,
            detail: error.message,
          });
        }
      }
      throw error;
    }
  });
};
