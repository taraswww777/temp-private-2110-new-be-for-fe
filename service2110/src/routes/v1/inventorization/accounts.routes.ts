import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
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
  inventoryManualUnitResponseSchema,
  inventorizationAccountColumnsResponseSchema,
  inventorizationAccountColumnsUpdateSchema,
} from '../../../schemas/inventorization/accounts.schema.ts';
import { idParamSchema } from '../../../schemas/common/id.schema.ts';

export const inventorizationAccountsRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/list', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Список счетов инвентаризации (пагинация, сортировка, фильтры)',
      body: getInventoryAccountsListRequestSchema,
      response: { 200: inventoryAccountsListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [], totalItems: 0 }));

  app.get('/columns', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Колонки таблицы счетов',
      response: { 200: inventorizationAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ columns: [] }));

  app.post('/columns', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Сохранить настройки колонок',
      body: inventorizationAccountColumnsUpdateSchema,
      response: { 200: inventorizationAccountColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ columns: [] }));

  app.post('/export', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Экспорт реестра счетов',
      body: inventoryAccountsExportRequestSchema,
      response: { 200: inventoryAccountsExportResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  app.post('/inventory', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Включить счета в инвентаризацию',
      body: inventoryAccountsInventoryRequestSchema,
      response: { 200: inventoryAccountsInventoryMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ affected: 0 }));

  app.post('/inventory/exclude', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Исключить счета из инвентаризации',
      body: inventoryAccountsInventoryExcludeRequestSchema,
      response: { 200: inventoryAccountsInventoryMutationResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ affected: 0 }));

  app.post('/manual-unit/bulk', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Ручной учёт: массовая операция',
      body: inventoryManualUnitBulkRequestSchema,
      response: { 200: inventoryManualUnitResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updated: 0 }));

  app.post('/manual-unit/:accountSurrogateId', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'Ручной учёт: одна запись (accountSurrogateId в URL)',
      params: inventoryAccountSurrogateIdParamSchema,
      body: z.object({}).optional(),
      response: { 200: inventoryManualUnitResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updated: 0 }));

  app.get('/surrogate/:accountSurrogateId/history', {
    schema: {
      tags: ['Inventorization - Accounts'],
      summary: 'История изменений по surrogate id счёта',
      params: inventoryAccountSurrogateIdParamSchema,
      response: { 200: inventoryAccountHistoryResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [] }));

  app.get('/:id', {
    schema: {
      tags: ['Inventorization - Accounts'],
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
