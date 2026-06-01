import type { FastifyPluginAsync } from 'fastify';
import { inventoryOrdersRoutes } from './orders.routes.ts';
import { inventoryDictionaryRoutes } from './dictionary.routes.ts';
import { inventoryAccountsRoutes } from './accounts.routes.ts';
import { inventoryCommonRoutes } from './inventory-common.routes.ts';
import { inventoryApprovalRoutes } from './approval.routes.ts';

export const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  await fastify.register(inventoryOrdersRoutes, { prefix: '/orders' });
  await fastify.register(inventoryDictionaryRoutes, { prefix: '/' });
  await fastify.register(inventoryAccountsRoutes, { prefix: '/accounts' });
  await fastify.register(inventoryApprovalRoutes, { prefix: '/approval' });
  await fastify.register(inventoryCommonRoutes, { prefix: '/' });
};
