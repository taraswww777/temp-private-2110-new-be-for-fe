import { z } from 'zod';

/**
 * Схема для филиала
 */
export const branchSchema = z.object({
  id: z.uuid().describe('Идентификатор филиала'),
  code: z.string().describe('Код филиала'),
  name: z.string().describe('Название филиала'),
});

export type Branch = z.infer<typeof branchSchema>;

/**
 * Схема для ответа со списком филиалов (прямой массив)
 */
export const branchesResponseSchema = z.array(branchSchema);

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
 * Схема для ответа со списком типов отчётов (прямой массив)
 */
export const reportTypesResponseSchema = z.array(reportTypeReferenceSchema);

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
 * Схема для ответа со списком валют (прямой массив)
 */
export const currenciesResponseSchema = z.array(currencyReferenceSchema);

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
 * Схема для ответа со списком форматов (прямой массив)
 */
export const formatsResponseSchema = z.array(formatReferenceSchema);

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
 * Схема для ответа со списком источников (прямой массив)
 */
export const sourcesResponseSchema = z.array(sourceSchema);

export type SourcesResponse = z.infer<typeof sourcesResponseSchema>;
