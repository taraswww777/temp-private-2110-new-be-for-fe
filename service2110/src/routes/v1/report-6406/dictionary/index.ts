import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { referencesService } from '../../../../services/report-6406/references.service.js';
import {
  branchesResponseSchema,
  currenciesResponseSchema,
  sourcesResponseSchema,
  employeeResponseSchema,
  accountMasksResponseSchema
} from '../../../../schemas/report-6406/dictionary.schema';

export const dictionaryRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/dictionary/branches
   * Получить список филиалов
   */
  app.get('/branches', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить список филиалов',
      response: {
        200: branchesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getBranches();
    return reply.status(200).send({ branches: result });
  });

  /**
   * GET /api/v1/report-6406/dictionary/currencies
   * Получить список валют
   */
  app.get('/currencies', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить список валют',
      response: {
        200: currenciesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getCurrencies();
    return reply.status(200).send({ currencies: result });
  });

  /**
   * GET /api/v1/report-6406/dictionary/sources
   * Получить список источников счетов
   */
  app.get('/sources', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить список источников счетов',
      response: {
        200: sourcesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getSources();
    return reply.status(200).send({ sources: result });
  });

  /**
   * GET /api/v1/report-6406/dictionary/account-masks
   * Получить маски счетов в виде связанного списка
   */
  app.get('/account-masks', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить маски счетов в виде связанного списка',
      response: {
        200: accountMasksResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getAccountMasks();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/dictionary/employee/{login}
   * Получить данные о сотруднике по AD-логину
   */
  app.get('/employee/:login', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить данные о сотруднике по AD-логину',
      params: z.object({
        login: z.string().max(30).regex(/^([^А-Яа-я\,\s\:]+)$/),
      }),
      response: {
        200: employeeResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getEmployee(request.params.adLogin);
    return reply.status(200).send(result);
  });
};
