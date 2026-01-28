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
  cancelTaskResponseSchema,
} from '../../../../schemas/report-6406/tasks.schema';
import { uuidParamSchema } from '../../../../schemas/common.schema';

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
      const task = await tasksService.createTask(request.body);
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
   * DELETE /api/v1/report-6406/tasks/:id
   * Удалить задание
   */
  app.delete('/:id', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Удалить задание',
      params: uuidParamSchema,
      response: {
        204: { type: 'null', description: 'Задание успешно удалено' },
      },
    },
  }, async (request, reply) => {
    try {
      await tasksService.deleteTask(request.params.id);
      return reply.status(204).send();
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
        if (error.message.includes('Cannot delete')) {
          return reply.status(409).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
            title: 'Conflict',
            status: 409,
            detail: error.message,
          });
        }
      }
      throw error;
    }
  });

  /**
   * POST /api/v1/report-6406/tasks/bulk-delete
   * Массовое удаление заданий
   */
  app.post('/bulk-delete', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Массовое удаление заданий',
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
   * POST /api/v1/report-6406/tasks/:id/cancel
   * Отменить задание
   */
  app.post('/:id/cancel', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Отменить задание (перевести в статус CANCELLED)',
      params: uuidParamSchema,
      response: {
        200: cancelTaskResponseSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const result = await tasksService.cancelTask(request.params.id);
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
        if (error.message.includes('Cannot cancel')) {
          return reply.status(409).send({
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.8',
            title: 'Conflict',
            status: 409,
            detail: error.message,
          });
        }
      }
      throw error;
    }
  });

  /**
   * POST /api/v1/report-6406/tasks/bulk-cancel
   * Массовая отмена заданий
   */
  app.post('/bulk-cancel', {
    schema: {
      tags: ['Report 6406 - Tasks'],
      summary: 'Массовая отмена заданий',
      body: bulkCancelTasksSchema,
      response: {
        200: bulkCancelResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await tasksService.bulkCancelTasks(request.body);
    return reply.status(200).send(result);
  });
};
