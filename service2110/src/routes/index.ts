import type { FastifyPluginAsync } from 'fastify';
import { v1Routes } from './v1';

export const routes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(v1Routes, { prefix: '/api/v1' });
};
