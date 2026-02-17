import { z } from 'zod';

/**
 * Схема для филиала
 */
export const branchSchema = z.object({
  id: z.number().int().describe('Идентификатор филиала'),
  codeCB: z.string().describe('Код ЦБ'),
  codeDAPP: z.string().describe('Код DAPP'),
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
  login: z.string().max(30).regex(/^([^А-Яа-я\,\s\:]+)$/),
});

export type Employee = z.infer<typeof employeeSchema>;

/**
 * Схема для ответа с данными сотрудника
 */
export const employeeResponseSchema = employeeSchema;

export type EmployeeResponse = z.infer<typeof employeeResponseSchema>;

/**
 * Схема для маски счета (связанный список)
 */
export const accountMaskItemSchema = z.object({
  firstAccount: z.number(),
  secondAccounts: z.array(z.number())
});

export type AccountMaskItem = z.infer<typeof accountMaskItemSchema>;

/**
 * Схема для ответа со списком масок счетов
 */
export const accountMasksResponseSchema = z.array(accountMaskItemSchema);

export type AccountMasksResponse = z.infer<typeof accountMasksResponseSchema>;
