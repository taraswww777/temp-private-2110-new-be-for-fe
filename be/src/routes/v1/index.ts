import type { FastifyPluginAsync } from 'fastify';
import { report6406Routes } from './report-6406/index.js';

export const v1Routes: FastifyPluginAsync = async (fastify) => {
  // API для формы отчётности 6406
  await fastify.register(report6406Routes, { prefix: '/report-6406' });
};
