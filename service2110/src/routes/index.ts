import type { FastifyPluginAsync } from 'fastify';
import { v1Routes } from './v1';
import { mockFilesRoutes } from './mock-files.ts';

export const routes: FastifyPluginAsync = async (fastify) => {
  // Mock файлы для разработки (без версионирования)
  await fastify.register(mockFilesRoutes);

  // API endpoints с версионированием v1
  await fastify.register(v1Routes, { prefix: '/api/v1' });
};
