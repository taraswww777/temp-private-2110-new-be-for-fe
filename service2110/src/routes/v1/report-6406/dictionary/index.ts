import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { referencesService } from '../../../../services/report-6406/references.service.js';
import {
  branchesResponseSchema,
  currenciesResponseSchema,
  sourcesResponseSchema,
  accountMasksResponseSchema,
  employeeSchema,
  adLoginParamSchema,
} from '../../../../schemas/report-6406/references.schema.js';
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
    return reply.status(200).send(result);
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
    return reply.status(200).send(result);
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
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/dictionary/account-masks
   * Получить список AccountMasks (связанный список)
   */
  app.get('/account-masks', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить список AccountMasks',
      response: {
        200: accountMasksResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getAccountMasks();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/dictionary/employee/{adLogin}
   * Получить данные о сотруднике по AD-логину
   */
  app.get('/employee/:adLogin', {
    schema: {
      tags: ['Report 6406 - Dictionary'],
      summary: 'Получить данные о сотруднике по AD-логину',
      params: adLoginParamSchema,
      response: {
        200: employeeSchema,
        404: {
          description: 'Сотрудник не найден',
          type: 'object',
          properties: {
            type: { type: 'string', example: 'https://tools.ietf.org/html/rfc7231#section-6.5.4' },
            title: { type: 'string', example: 'Not Found' },
            status: { type: 'number', example: 404 },
            detail: { type: 'string', example: 'Employee not found' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { adLogin } = request.params as { adLogin: string };
    const employee = await referencesService.getEmployeeByAdLogin(adLogin);
    
    if (!employee) {
      return reply.status(404).send({
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
        title: 'Not Found',
        status: 404,
        detail: 'Employee not found',
      });
    }
    
    return reply.status(200).send(employee);
  });
};