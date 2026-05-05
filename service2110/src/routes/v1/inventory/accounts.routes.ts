import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountDetailSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryAccountIdParamSchema,
  inventoryManualUnitRequestSchema,
  inventoryAccountStatusSingleSchema,
  inventoryAccountIdSchema,
  inventoryAccountsExportResponseSchema,
  accountVersionedIdsSchema,
  inventoryAccountUpdatedResponseSchema,
  inventoryAccountsListFilterSchema,
  inventoryManualUnitBulkRequestSchema,
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
  }, async (_request, reply) => reply.status(200).send({ items: [], totalItems: 0 }));

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

  app.get('/inventory-status/:accountId', {
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

  app.put('/inventory-status', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса и параметров инвентаризации счета',
      body: inventoryAccountStatusSingleSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/bulk', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса инвентаризации нескольких счетов по выборке',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.put('/update-by-filter', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса инвентаризации нескольких счетов по фильтру',
      body: inventoryAccountsListFilterSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.put('/manual-unit', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Смена ответственного для выбранного счета',
      body: inventoryManualUnitRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/manual-unit/bulk', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Смена ответственного для выбранных счетов',
      body: inventoryManualUnitBulkRequestSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.put('/inventory/exclude/bulk', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Исключение выбранных счетов из инвентаризации',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.put('/inventory/include/bulk', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Включение выбранных счетов из инвентаризации',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.get('/:accountId/history', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'История изменений конкретного счета',
      params: inventoryAccountIdParamSchema,
      response: { 200: inventoryAccountHistoryResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.get('/export', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Просмотр выгрузок',
      response: { 200: inventoryAccountsExportResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.post('/export', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Экспорт реестра счетов',
      body: inventoryAccountsExportRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/critical-update', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Метод для снятия пометки критичного обновления данных о счете',
      body: inventoryAccountIdSchema ,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));
};
