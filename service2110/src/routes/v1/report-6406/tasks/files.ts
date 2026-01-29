/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { taskFilesService } from '../../../../services/report-6406/task-files.service.js';
import {
  taskFilesQuerySchema,
  taskFilesResponseSchema,
  retryFileConversionResponseSchema,
} from '../../../../schemas/report-6406/task-files.schema.js';
import { uuidParamSchema, httpErrorSchema } from '../../../../schemas/common.schema.js';

// Схема для параметров с двумя UUID
const taskFileParamsSchema = z.object({
  taskId: z.string().uuid(),
  fileId: z.string().uuid(),
});

export const filesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/tasks/:id/files
   * Получить список файлов задания
   */
  app.get('/:id/files', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить список файлов задания',
      description: 'Возвращает список файлов с pre-signed URLs для скачивания. URLs генерируются автоматически для файлов в статусе COMPLETED.',
      params: uuidParamSchema,
      querystring: taskFilesQuerySchema,
      response: {
        200: taskFilesResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await taskFilesService.getTaskFiles(
        request.params.id,
        request.query
      );
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
   * POST /api/v1/report-6406/tasks/:taskId/files/:fileId/retry
   * Повторить конвертацию файла с ошибкой (экспериментальный endpoint)
   */
  app.post('/:taskId/files/:fileId/retry', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: '⚠️ [Экспериментальный] Повторить конвертацию файла с ошибкой',
      description: 'Экспериментальная функция для повтора конвертации файлов. В текущей версии возвращает 501 Not Implemented.',
      params: taskFileParamsSchema,
      response: {
        200: retryFileConversionResponseSchema,
        501: httpErrorSchema.describe('Функциональность ещё не реализована'),
      },
    },
  }, async (request, reply) => {
    try {
      const result = await taskFilesService.retryFileConversion(
        request.params.taskId,
        request.params.fileId
      );
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
        if (error.message.includes('does not belong')) {
          return reply.status(400).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Bad Request',
            status: 400,
            detail: error.message,
          });
        }
        if (error.message.includes('must be in FAILED status')) {
          return reply.status(409).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
            title: 'Conflict',
            status: 409,
            detail: error.message,
          });
        }
        if (error.message.includes('not implemented')) {
          return reply.status(501).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.6.2',
            title: 'Not Implemented',
            status: 501,
            detail: error.message,
          });
        }
      }
      throw error;
    }
  });
};
