import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Схема для филиала (BranchDto).
 */
export const branchSchema = z.object({
  id: zIdSchema.describe('ИД филиала'),
  codeCb: z.string().max(255).describe('Код ЦБ'),
  name: z.string().max(255).describe('Название филиала'),
});

export type Branch = z.infer<typeof branchSchema>;

/**
 * Схема для ответа со списком филиалов
 */
export const branchesResponseSchema = z.array(branchSchema);

export type BranchesResponse = z.infer<typeof branchesResponseSchema>;

/**
 * Схема для валюты (CurrencyDto).
 */
export const currencySchema = z.object({
  id: zIdSchema.describe('ИД валюты'),
  code: z.string().max(255).describe('Код валюты'),
  name: z.string().max(255).describe('Название валюты'),
});

export type Currency = z.infer<typeof currencySchema>;

/**
 * Схема для ответа со списком валют
 */
export const currenciesResponseSchema = z.array(currencySchema);

export type CurrenciesResponse = z.infer<typeof currenciesResponseSchema>;

/**
 * Схема для источника (SourceDto).
 */
export const sourceSchema = z.object({
  id: zIdSchema.describe('ИД источника'),
  code: z.string().max(255).describe('Код источника'),
  name: z.string().max(255).describe('Название источника'),
  ris: z.string().max(255).nullable().describe('RIS'),
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
 * Счёт (AccountDto по новому OAS).
 */
export const accountSchema = z.object({
  secondAccounts: z.array(z.string().max(255)).describe('Счета второго порядка'),
});

export type Account = z.infer<typeof accountSchema>;

/**
 * Ответ GET /dictionaries/accounts.
 */
export const accountsResponseSchema = z.array(accountSchema);

export type AccountsResponse = z.infer<typeof accountsResponseSchema>;

/** @deprecated используйте accountSchema */
export const accountMaskItemSchema = accountSchema;

export type AccountMaskItem = z.infer<typeof accountMaskItemSchema>;

/** @deprecated используйте accountsResponseSchema */
export const accountMasksResponseSchema = accountsResponseSchema;

export type AccountMasksResponse = z.infer<typeof accountMasksResponseSchema>;

(function registerReport6406DictionaryOpenApi() {
  registerReport6406OpenApiSchema(employeeLoginPathParamSchema, 'Report6406DictEmployeeLoginPathParamDto');
  registerReport6406OpenApiSchema(branchSchema, 'BranchDto');
  registerReport6406OpenApiSchema(branchesResponseSchema, 'BranchesResponseDto');
  registerReport6406OpenApiSchema(currencySchema, 'CurrencyDto');
  registerReport6406OpenApiSchema(currenciesResponseSchema, 'CurrenciesResponseDto');
  registerReport6406OpenApiSchema(sourceSchema, 'SourceDto');
  registerReport6406OpenApiSchema(sourcesResponseSchema, 'SourcesResponseDto');
  registerReport6406OpenApiSchema(employeeSchema, 'Report6406DictEmployeeDto');
  registerReport6406OpenApiSchema(employeeResponseSchema, 'Report6406DictEmployeeResponseDto');
  registerReport6406OpenApiSchema(accountSchema, 'AccountDto');
  registerReport6406OpenApiSchema(accountsResponseSchema, 'AccountsResponseDto');
})();
