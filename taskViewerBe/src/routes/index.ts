import type { FastifyPluginAsync } from 'fastify';
import { tasksRoutes } from './tasks.js';
import { youtrackRoutes } from './youtrack.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tasksRoutes, { prefix: '/api' });
  await fastify.register(youtrackRoutes, { prefix: '/api' });
};
