import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { referencesService } from '../../../../services/report-6406/references.service.js';
import {
  branchesResponseSchema,
  reportTypesResponseSchema,
  currenciesResponseSchema,
  formatsResponseSchema,
  sourcesResponseSchema,
} from '../../../../schemas/report-6406/references.schema';

export const referencesRoutes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  /**
   * GET /api/v1/report-6406/references/branches
   * Получить список филиалов
   */
  app.get('/branches', {
    schema: {
      tags: ['Report 6406 - References'],
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
   * GET /api/v1/report-6406/references/report-types
   * Получить список типов отчётов
   */
  app.get('/report-types', {
    schema: {
      tags: ['Report 6406 - References'],
      summary: 'Получить список типов отчётов',
      response: {
        200: reportTypesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getReportTypes();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/references/currencies
   * Получить список валют
   */
  app.get('/currencies', {
    schema: {
      tags: ['Report 6406 - References'],
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
   * GET /api/v1/report-6406/references/formats
   * Получить список форматов файлов
   */
  app.get('/formats', {
    schema: {
      tags: ['Report 6406 - References'],
      summary: 'Получить список форматов файлов',
      response: {
        200: formatsResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getFormats();
    return reply.status(200).send(result);
  });

  /**
   * GET /api/v1/report-6406/references/sources
   * Получить список источников счетов
   */
  app.get('/sources', {
    schema: {
      tags: ['Report 6406 - References'],
      summary: 'Получить список источников счетов',
      response: {
        200: sourcesResponseSchema,
      },
    },
  }, async (request, reply) => {
    const result = await referencesService.getSources();
    return reply.status(200).send(result);
  });
};
