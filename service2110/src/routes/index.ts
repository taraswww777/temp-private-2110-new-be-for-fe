import type { FastifyPluginAsync } from 'fastify';
import { healthRoutes } from './health.js';
import { v1Routes } from './v1/index.js';
import { mockFilesRoutes } from './mock-files.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint (без версионирования)
  await fastify.register(healthRoutes);
  
  // Mock файлы для разработки (без версионирования)
  await fastify.register(mockFilesRoutes);
  
  // API endpoints с версионированием v1
  await fastify.register(v1Routes, { prefix: '/api/v1' });
};
