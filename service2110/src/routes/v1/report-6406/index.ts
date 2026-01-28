import type { FastifyPluginAsync } from 'fastify';
import { referencesRoutes } from './references/index.js';
import { tasksRoutes } from './tasks/index.js';
import { statusHistoryRoutes } from './tasks/status-history.js';
import { filesRoutes } from './tasks/files.js';
import { exportRoutes } from './tasks/export.js';
import { packagesRoutes } from './packages/index.js';
import { storageRoutes } from './storage/index.js';

export const report6406Routes: FastifyPluginAsync = async (fastify) => {
  // Справочники
  await fastify.register(referencesRoutes, { prefix: '/references' });
  
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
