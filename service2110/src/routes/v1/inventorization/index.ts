import type { FastifyPluginAsync } from 'fastify';
import { inventorizationOrdersRoutes } from './orders.routes.ts';
import { inventorizationDictionaryRoutes } from './dictionary.routes.ts';
import { inventorizationAccountsRoutes } from './accounts.routes.ts';
import { inventorizationStatisticsRoutes } from './statistics.routes.ts';
import { inventorizationInventoryStateRoutes } from './inventory-state.routes.ts';

export const inventorizationRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(inventorizationOrdersRoutes, { prefix: '/orders' });
  await fastify.register(inventorizationDictionaryRoutes, { prefix: '/dictionary' });
  await fastify.register(inventorizationAccountsRoutes, { prefix: '/accounts' });
  await fastify.register(inventorizationStatisticsRoutes, { prefix: '/statistics' });
  await fastify.register(inventorizationInventoryStateRoutes, { prefix: '/inventory' });
};
