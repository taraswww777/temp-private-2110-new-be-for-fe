import type { FastifyPluginAsync } from 'fastify';
import { OpenApiTag } from '../../../../schemas/openapi-tags.ts';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  accountMasksResponseSchema,
  branchesResponseSchema,
  currenciesResponseSchema,
  employeeLoginPathParamSchema,
  employeeResponseSchema,
  sourcesResponseSchema,
} from '../../../../schemas/report-6406/dictionary.schema';

export const dictionaryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/dictionary/branches
   * Получить список филиалов
   */
  app.get('/branches', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получить список филиалов',
      response: {
        200: branchesResponseSchema,
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });

  /**
   * GET /api/v1/report-6406/dictionary/currencies
   * Получить список валют
   */
  app.get('/currencies', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получить список валют',
      response: {
        200: currenciesResponseSchema,
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });

  /**
   * GET /api/v1/report-6406/dictionary/sources
   * Получить список источников счетов
   */
  app.get('/sources', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получить список источников счетов',
      response: {
        200: sourcesResponseSchema,
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });

  /**
   * GET /api/v1/report-6406/dictionary/account-masks
   * Получить маски счетов в виде связанного списка
   */
  app.get('/account-masks', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получить маски счетов в виде связанного списка',
      response: {
        200: accountMasksResponseSchema,
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });

  /**
   * GET /api/v1/report-6406/dictionary/employee/{login}
   * Получить данные о сотруднике по AD-логину
   */
  app.get('/employee/:login', {
    schema: {
      tags: [OpenApiTag.Report6406Dictionary],
      summary: 'Получить данные о сотруднике по AD-логину',
      params: employeeLoginPathParamSchema,
      response: {
        200: employeeResponseSchema,
      },
    },
  }, async (request, reply) => {
    return reply.status(200).send({} as never);
  });
};
