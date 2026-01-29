/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { tasksService } from '../../../../services/report-6406/tasks.service.js';
import {
  createTaskSchema,
  taskSchema,
  tasksQuerySchema,
  tasksListResponseSchema,
  taskDetailSchema,
  bulkDeleteTasksSchema,
  bulkDeleteResponseSchema,
  bulkCancelTasksSchema,
  bulkCancelResponseSchema,
  startTasksSchema,
  startTasksResponseSchema,
} from '../../../../schemas/report-6406/tasks.schema.js';
import { uuidParamSchema, httpErrorSchema } from '../../../../schemas/common.schema.js';

export const tasksRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * POST /api/v1/report-6406/tasks
   * Создать новое задание на построение отчёта
   */
  app.post('/', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Создать новое задание на построение отчёта',
      body: createTaskSchema,
      response: {
        201: taskSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const task = await tasksService.createTask(request.body, request.user.name);
      return reply.status(201).send(task);
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
   * GET /api/v1/report-6406/tasks
   * Получить список заданий с пагинацией и фильтрацией
   */
  app.get('/', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить список заданий с пагинацией и фильтрацией',
      querystring: tasksQuerySchema,
      response: {
        200: tasksListResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await tasksService.getTasks(request.query);
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/tasks/:id
   * Получить детальную информацию о задании
   */
  app.get('/:id', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Получить детальную информацию о задании',
      params: uuidParamSchema,
      response: {
        200: taskDetailSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const task = await tasksService.getTaskById(request.params.id);
      return reply.status(200).send(task);
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
   * DELETE /api/v1/report-6406/tasks
   * Универсальное удаление заданий (одного или нескольких)
   */
  app.delete('/', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Удалить одно или несколько заданий',
      description: 'Удаляет задания. Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      body: bulkDeleteTasksSchema,
      response: {
        200: bulkDeleteResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await tasksService.bulkDeleteTasks(request.body);
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/report-6406/tasks/cancel
   * Универсальная отмена заданий (одного или нескольких)
   */
  app.post('/cancel', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Отменить одно или несколько заданий',
      description: 'Отменяет задания (переводит в статус KILLED_DAPP). Возвращает 200 OK с детальной информацией о результате операции для каждого задания.',
      body: bulkCancelTasksSchema,
      response: {
        200: bulkCancelResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await tasksService.bulkCancelTasks(request.body, request.user.name);
    return reply.status(200).send(result);
  });

  /**
   * POST /api/v1/report-6406/tasks/start
   * Запустить одно или несколько заданий на выполнение
   */
  app.post('/start', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Запустить задания на выполнение (переводит из статуса created в started)',
      description: 'Запускает задания на генерацию отчётов. Проверяет наличие свободного места в хранилище. Поддерживает запуск одного или нескольких заданий.',
      body: startTasksSchema,
      response: {
        200: startTasksResponseSchema,
        507: httpErrorSchema.describe('Недостаточно места в хранилище'),
      },
    },
  }, async (request, reply) => {
    try {
      const result = await tasksService.startTasks(request.body, request.user.name);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Not enough storage')) {
        return reply.status(507).send({
          type: 'https://tools.ietf.org/html/rfc7231#section-6.6.8',
          title: 'Insufficient Storage',
          status: 507,
          detail: error.message,
        });
      }
      throw error;
    }
  });
};
