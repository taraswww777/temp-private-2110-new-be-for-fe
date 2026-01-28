import type { FastifyPluginAsync } from 'fastify';
import { exampleRoutes } from './example.js';
import { healthRoutes } from './health.js';
import { v1Routes } from './v1/index.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint (без версионирования)
  await fastify.register(healthRoutes);
  
  // API endpoints с версионированием v1
  await fastify.register(v1Routes, { prefix: '/api/v1' });
  
  // Example routes (можно будет удалить позже)
  await fastify.register(exampleRoutes, { prefix: '/api/v1' });
};
