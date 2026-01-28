import type { FastifyPluginAsync } from 'fastify';
import { tasksRoutes } from './tasks.js';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tasksRoutes, { prefix: '/api' });
};
