import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  inventoryAccountStatusFilterResponseSchema,
  inventoryAccountStatusGroupFilterResponseSchema,
  inventoryAccountTypeFilterResponseSchema,
  inventoryBs2FilterResponseSchema,
  inventoryControlTypeFilterResponseSchema,
  inventoryInventoryOrderIdParamSchema,
  inventoryManualControlFilterResponseSchema,
  inventoryOrderFilterResponseSchema,
  inventoryProductFilterResponseSchema,
  inventoryResponsibleUnitFilterResponseSchema,
  inventoryResponsibleUnitTypeFilterResponseSchema,
  inventorySenderNamesFilterResponseSchema,
  inventorySourceBankFilterResponseSchema,
} from '../../../schemas/inventory/dictionary.schema.ts';

export const inventoryDictionaryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  const listFilters = [
    ['/orders/:inventoryOrderId/filters/bs2', 'БС-2 (фильтр)', inventoryBs2FilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/account-types', 'Тип счёта (фильтр)', inventoryAccountTypeFilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/responsible-units', 'Ответственное подразделение (фильтр)', inventoryResponsibleUnitFilterResponseSchema],
    ['/static-filters/responsible-unit-types', 'Тип ответственного подразделения (фильтр)', inventoryResponsibleUnitTypeFilterResponseSchema],
    ['/static-filters/inventory-account-statuses', 'Статус инвентаризации (фильтр)', inventoryAccountStatusFilterResponseSchema],
    ['/static-filters/orders', 'Список инвентаризаций (фильтр)', inventoryOrderFilterResponseSchema],
    ['/static-filters/inventory-account-status-groups', 'Статус инвентаризации (фильтр)', inventoryAccountStatusGroupFilterResponseSchema],
    ['/static-filters/control-type', 'Тип сверки (фильтр)', inventoryControlTypeFilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/source-banks', 'Банк-источник (фильтр)', inventorySourceBankFilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/product-names', 'Продукт (фильтр)', inventoryProductFilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/manual-control-rule-numbers', 'Номер правила ручного контроля (фильтр)', inventoryManualControlFilterResponseSchema],
    ['/orders/:inventoryOrderId/filters/sender-names', 'От кого (фильтр)', inventorySenderNamesFilterResponseSchema],
  ] as const;

  for (const [url, summary, response] of listFilters) {
    app.get(url, {
      schema: {
        tags: [OpenApiTag.InventoryDictionary],
        summary,
        params: inventoryInventoryOrderIdParamSchema,
        response: { 200: response },
      },
    }, async (_request, reply) => reply.status(200).send([]));
  }
};
