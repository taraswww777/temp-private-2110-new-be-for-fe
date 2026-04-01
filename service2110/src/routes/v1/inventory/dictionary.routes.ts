import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryAccountStatusFilterResponseSchema,
  inventoryAccountTypeFilterResponseSchema,
  inventoryBs2FilterResponseSchema,
  inventoryInventoryOrderIdParamSchema,
  inventoryManualControlFilterResponseSchema,
  inventoryProductFilterResponseSchema,
  inventoryResponsibleUnitFilterResponseSchema,
  inventoryResponsibleUnitTypeFilterResponseSchema,
  inventorySourceBankFilterResponseSchema,
} from '../../../schemas/inventory/dictionary.schema.ts';

export const inventoryDictionaryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  const listFilters = [
    ['/filters/bs2/:inventoryOrderId', 'БС-2 (фильтр)', inventoryBs2FilterResponseSchema],
    ['/filters/account-type/:inventoryOrderId', 'Тип счёта (фильтр)', inventoryAccountTypeFilterResponseSchema],
    ['/filters/responsible-unit/:inventoryOrderId', 'Ответственное подразделение (фильтр)', inventoryResponsibleUnitFilterResponseSchema],
    ['/filters/responsible-unit-type/:inventoryOrderId', 'Тип ответственного подразделения (фильтр)', inventoryResponsibleUnitTypeFilterResponseSchema],
    ['/filters/inventory-account-status/:inventoryOrderId', 'Статус инвентаризации (фильтр)', inventoryAccountStatusFilterResponseSchema],
    ['/filters/source-bank/:inventoryOrderId', 'Банк-источник (фильтр)', inventorySourceBankFilterResponseSchema],
    ['/filters/product-name/:inventoryOrderId', 'Продукт (фильтр)', inventoryProductFilterResponseSchema],
    ['/filters/manual-control-rule-number/:inventoryOrderId', 'Номер правила ручного контроля (фильтр)', inventoryManualControlFilterResponseSchema],
  ] as const;

  for (const [url, summary, response] of listFilters) {
    app.get(url, {
      schema: {
        tags: ['Inventory - Dictionary'],
        summary,
        params: inventoryInventoryOrderIdParamSchema,
        response: { 200: response },
      },
    }, async (_request, reply) => reply.status(200).send([]));
  }
};
