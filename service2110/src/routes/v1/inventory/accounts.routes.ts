import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsInventoryExcludeRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountDetailSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryAccountIdParamSchema,
  inventoryManualUnitRequestSchema,
  inventoryAccountColumnsResponseSchema,
  inventoryAccountColumnsUpdateSchema,
  inventoryAccountStatusSchema,
  inventoryColumnsQuerySchema,
  inventoryAccountsInventoryIncludeRequestSchema,
} from '../../../schemas/inventory/accounts.schema.ts';
import z from 'zod';

export const inventoryAccountsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Список счетов инвентаризации (пагинация, сортировка, фильтры)',
      body: getInventoryAccountsListRequestSchema,
      response: { 200: inventoryAccountsListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [], totalItems: 0 }));

  app.get('/:accountId', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Деталь счёта по accountId',
      params: inventoryAccountIdParamSchema,
      response: { 200: inventoryAccountDetailSchema },
    },
  }, async (_request, reply) =>
    reply.status(200).send({
      accountId: 1,
    }));

  app.get('/inventory-status/:accountId', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Запрос данных о статусе и параметрах инвентаризации для конкретного счета',
      response: { 200: inventoryAccountStatusSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  app.put('/inventory-status', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Установка статуса и параметров инвентаризации счета',
      body: inventoryAccountStatusSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/manual-unit', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Изменение поля "Ответственное подразделение, проставленное вручную"',
      body: inventoryManualUnitRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/inventory/exclude', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Исключить счета из инвентаризации',
      body: inventoryAccountsInventoryExcludeRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.put('/inventory/include', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Включить счета в инвентаризацию',
      body: inventoryAccountsInventoryIncludeRequestSchema ,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.get('/:accountId/history', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'История изменений конкретного счета',
      params: inventoryAccountIdParamSchema,
      response: { 200: inventoryAccountHistoryResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.get('/columns', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Колонки таблицы счетов',
      querystring: inventoryColumnsQuerySchema,
      response: { 200: inventoryAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.put('/columns', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Сохранить настройки колонок',
      body: inventoryAccountColumnsUpdateSchema,
      response: { 200: inventoryAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.post('/export', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Экспорт реестра счетов',
      body: inventoryAccountsExportRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));
};
