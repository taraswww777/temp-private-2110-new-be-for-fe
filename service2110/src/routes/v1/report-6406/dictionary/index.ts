import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  accountsResponseSchema,
  branchesResponseSchema,
  currenciesResponseSchema,
  sourcesResponseSchema,
} from '../../../../schemas/report-6406/dictionary.schema.ts';

export const dictionariesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/branches', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получение списка филиалов',
      description: 'Возвращает список филиалов банка',
      response: {
        200: branchesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });

  app.get('/currencies', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получение списка валют',
      description: 'Возвращает список доступных валют',
      response: {
        200: currenciesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });

  app.get('/sources', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получение списка источников',
      description: 'Возвращает список источников данных',
      response: {
        200: sourcesResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });

  app.get('/accounts', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получение списка счетов',
      description: 'Возвращает список счетов',
      response: {
        200: accountsResponseSchema,
      },
    },
  }, async (_request, reply) => {
    return reply.status(200).send([] as never);
  });
};

