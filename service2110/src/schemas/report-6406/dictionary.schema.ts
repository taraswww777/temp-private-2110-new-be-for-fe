import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Схема для филиала
 */
export const branchSchema = z.object({
  id: zIdSchema.describe('ИД филиала'),
  codeCB: z.string().describe('Код ЦБ'),
  name: z.string().describe('Название филиала'),
});

export type Branch = z.infer<typeof branchSchema>;

/**
 * Схема для ответа со списком филиалов
 */
export const branchesResponseSchema = z.array(branchSchema);

export type BranchesResponse = z.infer<typeof branchesResponseSchema>;

/**
 * Схема для валюты
 */
export const currencySchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type Currency = z.infer<typeof currencySchema>;

/**
 * Схема для ответа со списком валют
 */
export const currenciesResponseSchema = z.array(currencySchema);

export type CurrenciesResponse = z.infer<typeof currenciesResponseSchema>;

/**
 * Схема для источника
 */
export const sourceSchema = z.object({
  code: z.string(),
  name: z.string(),
  ris: z.string().nullable(),
});

export type Source = z.infer<typeof sourceSchema>;

/**
 * Схема для ответа со списком источников
 */
export const sourcesResponseSchema = z.array(sourceSchema);

export type SourcesResponse = z.infer<typeof sourcesResponseSchema>;

/**
 * Схема для сотрудника
 */
export const employeeSchema = z.object({
  fullName: z.string().max(50),
  login: z.string().max(15),
});

export type Employee = z.infer<typeof employeeSchema>;

/**
 * Схема для ответа с данными сотрудника
 */
export const employeeResponseSchema = employeeSchema;

export type EmployeeResponse = z.infer<typeof employeeResponseSchema>;

/**
 * Параметры пути GET …/dictionary/employee/:login
 */
export const employeeLoginPathParamSchema = z.object({
  login: z.string().max(15),
});

/**
 * Схема для маски счета (связанный список)
 */
export const accountMaskItemSchema = z.object({
  firstAccount: z.string(),
  secondAccounts: z.array(z.string())
});

export type AccountMaskItem = z.infer<typeof accountMaskItemSchema>;

/**
 * Схема для ответа со списком масок счетов
 */
export const accountMasksResponseSchema = z.array(accountMaskItemSchema);

export type AccountMasksResponse = z.infer<typeof accountMasksResponseSchema>;

(function registerReport6406DictionaryOpenApi() {
  registerReport6406OpenApiSchema(employeeLoginPathParamSchema, 'Report6406DictEmployeeLoginPathParamDto');
  registerReport6406OpenApiSchema(branchSchema, 'Report6406DictBranchDto');
  registerReport6406OpenApiSchema(branchesResponseSchema, 'Report6406DictBranchesResponseDto');
  registerReport6406OpenApiSchema(currencySchema, 'Report6406DictCurrencyDto');
  registerReport6406OpenApiSchema(currenciesResponseSchema, 'Report6406DictCurrenciesResponseDto');
  registerReport6406OpenApiSchema(sourceSchema, 'Report6406DictSourceDto');
  registerReport6406OpenApiSchema(sourcesResponseSchema, 'Report6406DictSourcesResponseDto');
  registerReport6406OpenApiSchema(employeeSchema, 'Report6406DictEmployeeDto');
  registerReport6406OpenApiSchema(employeeResponseSchema, 'Report6406DictEmployeeResponseDto');
  registerReport6406OpenApiSchema(accountMaskItemSchema, 'AccountMaskItemDto');
  registerReport6406OpenApiSchema(accountMasksResponseSchema, 'AccountMasksResponseDto');
})();
