import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getInventoryApprovalListRequestSchema, inventoryApprovalListResponseSchema } from '../../../schemas/inventory/approval.schema.ts';

export const inventoryApprovalRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    schema: {
      tags: [OpenApiTag.InventoryApproval],
      summary: 'Список счетов на утверждение смены ответственного подразделения (пагинация, сортировка, фильтры)',
      body: getInventoryApprovalListRequestSchema,
      response: { 200: inventoryApprovalListResponseSchema },
    },
  }, async (_request, reply) => reply.status(200).send({ itemsList: [], totalItems: 0 }));
};
