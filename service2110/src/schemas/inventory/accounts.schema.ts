import { z } from 'zod';

import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { dateSchema, dateTimeSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';

/** Десятичные суммы в DOC передаются как string($decimal). */
export const inventoryDecimalStringSchema = z
  .string()
  .describe('Десятичное значение как строка (как в DOC string($decimal))');

export const inventoryAccountListSortColumnSchema = z.enum([
  'id',
  'accountNumber',
  'accountSurrogateId',
  'updatedAt',
]);

export const inventoryAccountsListSortingSchema = z.object({
  sortOrder: sortOrderSchema,
  sortBy: inventoryAccountListSortColumnSchema.describe('Колонка для сортировки'),
});

/**
 * Поля фильтров POST /accounts (DOC) — группировка в `filters` тела списка.
 * Имена и типы по «Описание front-API-28»; массивы — множественный выбор.
 */
export const inventoryAccountsListFilterSchema = z.object({
  bs2: z.array(zIdSchema).optional().describe('БС-2 (массив int)'),
  accountNum: z.string().optional().describe('Номер счёта (accountNum в DOC)'),
  accountType: z.array(zIdSchema).optional().describe('Типы счёта (массив)'),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleUnitType: z.array(z.string()).optional(),
  inventoryAccountStatus: z.array(z.string()).optional(),
  sourceBank: z.array(z.string()).optional(),
  productName: z.array(z.string()).optional(),
  manualControlRuleNumber: z.array(zIdSchema).optional(),
  showZeroBalanceAccounts: z.boolean().optional(),
  isExclude: z.boolean().optional(),
}).describe('Фильтр для списка счетов');

/** Тело POST …/accounts/list — как `getTasksRequestSchema` в report-6406. */
export const getInventoryAccountsListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: inventoryAccountsListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)').optional(),
  filters: inventoryAccountsListFilterSchema,
});

/**
 * Строка списка / деталь счёта — полный атрибутный состав ответа DOC (раздел 3.1),
 * `accountSurrogateKey` → `accountSurrogateId`, `accountNum` → `accountNumber`.
 */
export const inventoryAccountRowSchema = z.object({
  accountId: z.uuid().describe('ID счета'),
  accountNum: z.string().optional().describe('Номер счёта (DOC: accountNum)'),
  accountOpenDate: dateSchema.optional(),
  accountType: zIdSchema.optional(),
  clientName: z.string().optional(),
  agreementNum: z.string().optional(),
  originalResponsibleUnit: z.string().optional(),
  bs2: zIdSchema.optional(),
  accountName: z.string().optional(),
  lastOperationDate: dateSchema.optional(),
  agreementStatus: z.string().optional(),
  accountOutRubSum: inventoryDecimalStringSchema.optional(),
  accountOutSum: inventoryDecimalStringSchema.optional(),
  productCode: z.string().optional(),
  productName: z.string().optional(),
  manualControlRuleNumber: zIdSchema.optional(),
  manualControlFlag: z.boolean().optional(),
  inventoryAccountStatus: z.string().optional(),
  reversedDebitSumRub: inventoryDecimalStringSchema.optional(),
  reversedDebitSum: inventoryDecimalStringSchema.optional(),
  reversedCreditSumRub: inventoryDecimalStringSchema.optional(),
  reversedCreditSum: inventoryDecimalStringSchema.optional(),
  sourceBank: z.string().optional(),
  dataDate: dateSchema.optional(),
  currencyIsoCode: z.string().optional(),
  clientInn: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalStringSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateSchema.optional(),
  manualResponsibleUnit: z.string().optional(),
  isCriticalUpdated: z.boolean().optional(),
  version: zIdSchema.optional(),
});

export const inventoryAccountListItemSchema = inventoryAccountRowSchema;

export const inventoryAccountsListResponseSchema = z.object({
  items: z.array(inventoryAccountListItemSchema).describe('Список счетов'),
  totalItems: z.number().int().min(0).describe('Общее количество счетов'),
});

export const inventoryAccountDetailSchema = inventoryAccountRowSchema;

export const inventoryAccountHistoryItemSchema = z.object({
  changeDate:dateTimeSchema,
  changedBy: z.string(),
  fieldName: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
});

export const inventoryAccountHistoryResponseSchema = z.array(inventoryAccountHistoryItemSchema);

export const inventoryAccountIdParamSchema = z.object({
  accountId: z.uuid(),
});
export const inventoryAccountIdsSchema = z.object({
  accountId: z.array(z.uuid()).min(1),
});

export const inventoryManualUnitRequestSchema = z.object({
  accountId: z.uuid(),
  manualResponsibleUnit: z.string().optional(),
  force: z.boolean().optional(),
  version: zIdSchema,
});

export const inventoryAccountsExportRequestSchema = z.object({
  accountIds: z.array(z.uuid()).optional(),
  filters: inventoryAccountsListFilterSchema.optional(),
});

export const inventoryAccountStatusSchema = z.object({
  accountId: z.uuid(),
  manualInventoryAccountStatus: z.string(),
  originalInventoryAccountStatus: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalStringSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateSchema.optional(),
  version: zIdSchema.optional(),
});
