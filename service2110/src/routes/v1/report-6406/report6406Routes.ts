import type { FastifyPluginAsync } from 'fastify';
import { dictionariesRoutes, dictionaryEmployeeRoute } from './dictionary/index.ts';
import { tasksRoutes } from './tasks/index.ts';
import { statusHistoryRoutes } from './tasks/status-history.ts';
import { filesRoutes } from './tasks/files.ts';
import { exportRoutes } from './tasks/export.ts';
import { packagesRoutes } from './packages/index.ts';
import { storageRoutes } from './storage/index.ts';
import { createTaskRoute } from './tasks/create.routes.ts';

export const report6406Routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(dictionariesRoutes, { prefix: '/dictionaries' });
  await fastify.register(dictionaryEmployeeRoute, { prefix: '/dictionary' });

  await fastify.register(tasksRoutes, { prefix: '/tasks' });
  await fastify.register(statusHistoryRoutes, { prefix: '/tasks' });
  await fastify.register(filesRoutes, { prefix: '/tasks' });
  await fastify.register(packagesRoutes, { prefix: '/packages' });

  await fastify.register(storageRoutes, { prefix: '/storages' });
};


export const report6406FileRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(createTaskRoute, { prefix: '/tasks' });
  await fastify.register(exportRoutes, { prefix: '/tasks' });
};
