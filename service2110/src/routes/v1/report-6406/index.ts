import type { FastifyPluginAsync } from 'fastify';
import { dictionaryRoutes } from './dictionary/index.ts';
import { tasksRoutes } from './tasks/index.ts';
import { statusHistoryRoutes } from './tasks/status-history.ts';
import { filesRoutes } from './tasks/files.ts';
import { exportRoutes } from './tasks/export.ts';
import { packagesRoutes } from './packages/index.ts';
import { storageRoutes } from './storage/index.ts';

export const report6406Routes: FastifyPluginAsync = async (fastify) => {
  // Справочники (переименовано из references)
  await fastify.register(dictionaryRoutes, { prefix: '/dictionary' });

  // Задания на построение отчётов (базовые маршруты)
  await fastify.register(tasksRoutes, { prefix: '/tasks' });

  // История статусов заданий
  await fastify.register(statusHistoryRoutes, { prefix: '/tasks' });

  // Файлы заданий
  await fastify.register(filesRoutes, { prefix: '/tasks' });

  // Экспорт реестра заданий
  await fastify.register(exportRoutes, { prefix: '/tasks' });

  // Пакеты заданий
  await fastify.register(packagesRoutes, { prefix: '/packages' });

  // Мониторинг хранилища
  await fastify.register(storageRoutes, { prefix: '/storage' });
};
