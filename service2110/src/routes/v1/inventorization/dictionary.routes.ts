import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventorizationBs2FilterResponseSchema,
  inventorizationDictionaryListResponseSchema,
  inventorizationInventoryOrderIdParamSchema,
} from '../../../schemas/inventorization/dictionary.schema.ts';

export const inventorizationDictionaryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/filters/bs2/:inventoryOrderId', {
    schema: {
      tags: ['Inventorization - Dictionary'],
      summary: 'Справочник БС-2 для фильтров (только id и bs2Name)',
      params: inventorizationInventoryOrderIdParamSchema,
      response: { 200: inventorizationBs2FilterResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ items: [] }));

  const listFilters = [
    ['/filters/account-type/:inventoryOrderId', 'Тип счёта (фильтр)'],
    ['/filters/responsible-unit/:inventoryOrderId', 'Ответственное подразделение (фильтр)'],
    ['/filters/responsible-unit-type/:inventoryOrderId', 'Тип ответственного подразделения (фильтр)'],
    ['/filters/inventory-status/:inventoryOrderId', 'Статус инвентаризации (фильтр)'],
    ['/filters/source-bank/:inventoryOrderId', 'Банк-источник (фильтр)'],
    ['/filters/product/:inventoryOrderId', 'Продукт (фильтр)'],
    ['/filters/manual-control-rule-number/:inventoryOrderId', 'Номер правила ручного контроля (фильтр)'],
  ] as const;

  for (const [url, summary] of listFilters) {
    app.get(url, {
      schema: {
        tags: ['Inventorization - Dictionary'],
        summary,
        params: inventorizationInventoryOrderIdParamSchema,
        response: { 200: inventorizationDictionaryListResponseSchema },
      },
    }, async (_request, reply) => reply.status(200).send({ items: [] }));
  }
};
