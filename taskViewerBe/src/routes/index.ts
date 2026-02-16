import type { FastifyPluginAsync } from 'fastify';
import { tasksRoutes } from './tasks.ts';
import { youtrackRoutes } from './youtrack.ts';
import { projectsRoutes } from './projects.ts';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(tasksRoutes, { prefix: '/api' });
  await fastify.register(youtrackRoutes, { prefix: '/api' });
  await fastify.register(projectsRoutes, { prefix: '/api' });
};
