import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryColumnsResponseSchema,
  inventoryColumnsUpdateSchema,
  inventoryColumnsQuerySchema,
  inventoryInventoryStateQuerySchema,
  inventoryInventoryStateResponseSchema,
  inventoryActiveStateSchema,
  inventoryFileSchema,
} from '../../../schemas/inventory/inventory-common.schema.ts';
import z from 'zod';
import { accountVersionedIdsSchema, inventoryAccountsExportRequestSchema, inventoryAccountsExportResponseSchema, inventoryAccountsListFilterSchema, inventoryAccountStatusSingleSchema, inventoryAccountUpdatedResponseSchema, inventoryManualUnitBulkRequestSchema } from '../../../schemas/inventory/accounts.schema.ts';
import { inventoryStatisticsExportRequestSchema, inventoryStatisticsExportResponseSchema } from '../../../schemas/inventory/statistics.schema.ts';
import { userRolesResponseSchema } from '../../../schemas/common/userRoles.schema.ts';

export const inventoryCommonRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/inventory/state', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Статус процесса инвентаризации',
      querystring: inventoryInventoryStateQuerySchema,
      response: { 200: inventoryInventoryStateResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({}));

  
  app.get('/columns', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Колонки таблицы',
      querystring: inventoryColumnsQuerySchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.put('/columns', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Сохранить настройки колонок',
      body: inventoryColumnsUpdateSchema,
      response: { 200: inventoryColumnsResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.patch('/settings/inventory-active-status', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Запрос изменения активности инвентаризации',
      body: inventoryActiveStateSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.patch('/bulk-manual-units', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Смена ответственного для выбранных счетов',
      body: inventoryManualUnitBulkRequestSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));
  
  app.patch('/bulk-inventory', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса инвентаризации нескольких счетов по выборке',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.patch('/bulk-exclude', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Исключение выбранных счетов из инвентаризации',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));


  app.patch('/bulk-include', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Включение выбранных счетов из инвентаризации',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));

  app.post('/accounts-export', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Экспорт реестра счетов',
      body: inventoryAccountsExportRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.get('/statistics-export', {
    schema: {
      tags: [OpenApiTag.InventoryStatistics],
      summary: 'Запрос списка сформированных статистик',
      response: { 200: inventoryStatisticsExportResponseSchema },
    },
  }, async (_request, reply) =>
    reply.status(200).send([]));

  app.post('/statistics-export', {
    schema: {
      tags: [OpenApiTag.InventoryStatistics],
      summary: 'Экспорт статистики инвентаризации',
      body: inventoryStatisticsExportRequestSchema,
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.patch('/inventory-status', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Установка статуса инвентаризации нескольких счетов по фильтру',
      body: inventoryAccountsListFilterSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));


  app.get('/accounts-export', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Просмотр выгрузок',
      response: { 200: inventoryAccountsExportResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send([]));

  app.get('/user/roles', {
    schema: {
      tags: [OpenApiTag.InventoryAccounts],
      summary: 'Просмотр ролей пользователя',
      response: { 200: userRolesResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ login: 'vtb1234567', roleAssignments: [] }));

 app.get('/download', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Скачать файл',
      querystring: inventoryFileSchema,
      response: { 200: z.file() },
    },
  }, async (_request, reply) => reply.status(200).send({} as never));

  app.delete('order/:orderId/file', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Удалить файл',
      response: { 200: z.null() },
    },
  }, async (_request, reply) => reply.status(200).send(null));

  app.post('/order/:orderId/upload', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Загрузить файл',
      consumes: ['multipart/form-data'],
      body: z.object({
        file: z.any().describe('Файл задачи'),
      }),
      response: { 200: inventoryFileSchema },
    },
}, async (_request, reply) => reply.status(200).send({} as never));

  app.patch('/bulk-approval', {
    schema: {
      tags: [OpenApiTag.Inventory],
      summary: 'Подтверждение смены ответственного подразделения',
      body: accountVersionedIdsSchema,
      response: { 200: inventoryAccountUpdatedResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ updatedCount: 0 }));
};
