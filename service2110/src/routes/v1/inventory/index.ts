import type { FastifyPluginAsync } from 'fastify';
import { inventoryOrdersRoutes } from './orders.routes.ts';
import { inventoryDictionaryRoutes } from './dictionary.routes.ts';
import { inventoryAccountsRoutes } from './accounts.routes.ts';
import { inventoryStatisticsRoutes } from './statistics.routes.ts';
import { inventoryCommonRoutes } from './inventory-common.routes.ts';

export const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(inventoryOrdersRoutes, { prefix: '/orders' });
  await fastify.register(inventoryDictionaryRoutes, { prefix: '/dictionary' });
  await fastify.register(inventoryAccountsRoutes, { prefix: '/accounts' });
  await fastify.register(inventoryStatisticsRoutes, { prefix: '/statistics' });
  await fastify.register(inventoryCommonRoutes, { prefix: '/' });
};
