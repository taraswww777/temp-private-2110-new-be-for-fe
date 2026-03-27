import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  getInventoryAccountsListRequestSchema,
  inventoryAccountsExportRequestSchema,
  inventoryAccountsExportResponseSchema,
  inventoryAccountsInventoryExcludeRequestSchema,
  inventoryAccountsInventoryMutationResponseSchema,
  inventoryAccountsInventoryRequestSchema,
  inventoryAccountsListResponseSchema,
  inventoryAccountDetailSchema,
  inventoryAccountHistoryResponseSchema,
  inventoryAccountSurrogateIdParamSchema,
  inventoryManualUnitBulkRequestSchema,
  inventoryManualUnitSingleRequestSchema,
  inventoryManualUnitResponseSchema,
  inventoryAccountColumnsResponseSchema,
  inventoryAccountColumnsUpdateSchema,
} from '../../../schemas/inventory/accounts.schema.ts';
import { idParamSchema } from '../../../schemas/common/id.schema.ts';

export const inventoryAccountsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Список счетов инвентаризации (пагинация, сортировка, фильтры)',
      body: getInventoryAccountsListRequestSchema,
      response: { 200: inventoryAccountsListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [], totalItems: 0 }));

  app.get('/columns', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Колонки таблицы счетов',
      response: { 200: inventoryAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ columns: [] }));

  app.post('/columns', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Сохранить настройки колонок',
      body: inventoryAccountColumnsUpdateSchema,
      response: { 200: inventoryAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ columns: [] }));

  app.post('/export', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Экспорт реестра счетов',
      body: inventoryAccountsExportRequestSchema,
      response: { 200: inventoryAccountsExportResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  app.post('/inventory', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Включить счета в инвентаризацию',
      body: inventoryAccountsInventoryRequestSchema,
      response: { 200: inventoryAccountsInventoryMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ affected: 0 }));

  app.post('/inventory/exclude', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Исключить счета из инвентаризации',
      body: inventoryAccountsInventoryExcludeRequestSchema,
      response: { 200: inventoryAccountsInventoryMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ affected: 0 }));

  app.post('/manual-unit/bulk', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Ручной учёт: массовая операция',
      body: inventoryManualUnitBulkRequestSchema,
      response: { 200: inventoryManualUnitResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updated: 0 }));

  app.post('/manual-unit/:accountSurrogateId', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Ручной учёт: одна запись (accountSurrogateId в URL)',
      params: inventoryAccountSurrogateIdParamSchema,
      body: inventoryManualUnitSingleRequestSchema,
      response: { 200: inventoryManualUnitResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updated: 0 }));

  app.get('/surrogate/:accountSurrogateId/history', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'История изменений по surrogate id счёта',
      params: inventoryAccountSurrogateIdParamSchema,
      response: { 200: inventoryAccountHistoryResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [] }));

  app.get('/:id', {
    schema: {
      tags: ['Inventory - Accounts'],
      summary: 'Деталь счёта по id',
      params: idParamSchema,
      response: { 200: inventoryAccountDetailSchema },
    },
  }, async (_request, reply) =>
    reply.status(200).send({
      id: 1,
      accountSurrogateId: 1,
    }));
};
