import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountDetailSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryAccountIdParamSchema,
  inventoryManualUnitRequestSchema,
  inventoryAccountStatusSingleSchema,
  inventoryAccountHistoryRequestSchema,
  inventoryAccountStatusSingleRequestSchema,
} from '../../../schemas/inventory/accounts.schema.ts';
import z from 'zod';
import { randomUUID } from 'crypto';

export const inventoryAccountsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Список счетов инвентаризации (пагинация, сортировка, фильтры)',
      body: getInventoryAccountsListRequestSchema,
      response: { 200: inventoryAccountsListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ itemsList: [], totalItems: 0 }));

  app.get('/:accountId', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Деталь счёта по accountId',
      params: inventoryAccountIdParamSchema,
      response: { 200: inventoryAccountDetailSchema },
    },
  }, async (_request, reply) =>
    reply.status(200).send({
      accountId: randomUUID(),
      version: 1,
    }));

  app.get('/:accountId/inventory-status', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Запрос данных о статусе и параметрах инвентаризации для конкретного счета',
      response: { 200: inventoryAccountStatusSingleSchema },
    },
  }, async (_request, reply) =>
      reply.status(200).send({
        accountId: "1",
        manualInventoryAccountStatus: "1",
        version: 1
      }),
  );

  app.patch('/:accountId/manual-unit', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Смена ответственного для выбранного счета',
      body: inventoryManualUnitRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.post('/:accountId/history', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'История изменений конкретного счета',
      params: inventoryAccountIdParamSchema,
      body: inventoryAccountHistoryRequestSchema,
      response: { 200: inventoryAccountHistoryResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ itemsList: [], totalItems: 0 }));

  app.patch('/:accountId/inventory-status', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса и параметров инвентаризации счета',
      body: inventoryAccountStatusSingleRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));
};
