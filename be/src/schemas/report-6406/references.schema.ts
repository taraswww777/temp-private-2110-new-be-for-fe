import { z } from 'zod';

/**
 * Схема для филиала
 */
export const branchSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
});

export type Branch = z.infer<typeof branchSchema>;

/**
 * Схема для ответа со списком филиалов
 */
export const branchesResponseSchema = z.object({
  branches: z.array(branchSchema),
});

export type BranchesResponse = z.infer<typeof branchesResponseSchema>;

/**
 * Схема для типа отчёта
 */
export const reportTypeReferenceSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type ReportTypeReference = z.infer<typeof reportTypeReferenceSchema>;

/**
 * Схема для ответа со списком типов отчётов
 */
export const reportTypesResponseSchema = z.object({
  reportTypes: z.array(reportTypeReferenceSchema),
});

export type ReportTypesResponse = z.infer<typeof reportTypesResponseSchema>;

/**
 * Схема для валюты
 */
export const currencyReferenceSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type CurrencyReference = z.infer<typeof currencyReferenceSchema>;

/**
 * Схема для ответа со списком валют
 */
export const currenciesResponseSchema = z.object({
  currencies: z.array(currencyReferenceSchema),
});

export type CurrenciesResponse = z.infer<typeof currenciesResponseSchema>;

/**
 * Схема для формата
 */
export const formatReferenceSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type FormatReference = z.infer<typeof formatReferenceSchema>;

/**
 * Схема для ответа со списком форматов
 */
export const formatsResponseSchema = z.object({
  formats: z.array(formatReferenceSchema),
});

export type FormatsResponse = z.infer<typeof formatsResponseSchema>;

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
export const sourcesResponseSchema = z.object({
  sources: z.array(sourceSchema),
});

export type SourcesResponse = z.infer<typeof sourcesResponseSchema>;
