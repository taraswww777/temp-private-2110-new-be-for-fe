import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getTasksRequestSchema,
  tasksListResponseSchema,
} from '../../../../schemas/report-6406/tasks.schema.ts';

/**
 * POST /api/v1/report-6406/tasks/list
 * Получить список заданий с пагинацией, сортировкой и фильтрацией (body: pagination, sorting, filter).
 * Используется POST вместо GET, т.к. Fastify не поддерживает body для GET; структура запроса/ответа по TASK-011.
 * 
 * MOCK: Возвращает пустой список для генерации Swagger-спецификации
 */
export const listTasksRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить список заданий (пагинация, сортировка, фильтрация)',
      description: 'Тело запроса: pagination (number, size), sorting (direction, column), filter (опционально, объект с заранее определённой структурой). Ответ: items, totalItems. Фильтр — объект с опциональными полями: packageId (UUID или null для заданий без пакета), branchIds (массив UUID), branchName, status, reportType, format, source, createdBy, periodStart (YYYY-MM-DD), periodEnd (YYYY-MM-DD), createdAt (ISO 8601), updatedAt (ISO 8601). Можно комбинировать несколько фильтров одновременно.',
      body: getTasksRequestSchema,
      response: {
        200: tasksListResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send({ items: [], totalItems: 0 });
  });
};
