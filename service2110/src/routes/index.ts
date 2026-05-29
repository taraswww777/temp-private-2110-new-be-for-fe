import type { FastifyPluginAsync } from 'fastify';
import { v1Routes } from './v1';
import { inventoryFileRoutes } from './inventory-file.routes';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(v1Routes, { prefix: '/api/v1' });
  await fastify.register(inventoryFileRoutes);
};
