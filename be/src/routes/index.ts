import type { FastifyPluginAsync } from 'fastify';
import { exampleRoutes } from './example.js';
import { healthRoutes } from './health.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  // Health check endpoint (без версионирования)
  await fastify.register(healthRoutes);
  
  // API endpoints с версионированием
  await fastify.register(exampleRoutes, { prefix: '/api/v1' });
};
