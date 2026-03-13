import type { FastifyPluginAsync } from 'fastify';
import { createTaskRoute } from './create.routes.ts';
import { listTasksRoute } from './list.routes.ts';
import { getTaskRoute } from './get.routes.ts';
import { deleteTasksRoute } from './delete.routes.ts';
import { cancelTasksRoute } from './cancel.routes.ts';
import { startTasksRoute } from './start.routes.ts';

/**
 * Регистрация всех роутов для работы с заданиями (tasks)
 * Все эндпоинты замокированы для генерации Swagger-спецификации
 */
export const tasksRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(createTaskRoute);
  await fastify.register(listTasksRoute);
  await fastify.register(getTaskRoute);
  await fastify.register(deleteTasksRoute);
  await fastify.register(cancelTasksRoute);
  await fastify.register(startTasksRoute);
};
