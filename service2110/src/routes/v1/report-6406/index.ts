import type { FastifyPluginAsync } from 'fastify';
import { referencesRoutes } from './references/index.js';
import { tasksRoutes } from './tasks/index.js';
import { packagesRoutes } from './packages/index.js';

export const report6406Routes: FastifyPluginAsync = async (fastify) => {
  // Справочники
  await fastify.register(referencesRoutes, { prefix: '/references' });
  
  // Задания на построение отчётов
  await fastify.register(tasksRoutes, { prefix: '/tasks' });
  
  // Пакеты заданий
  await fastify.register(packagesRoutes, { prefix: '/packages' });
};
