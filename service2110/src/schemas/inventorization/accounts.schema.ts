import { z } from 'zod';

import { sortOrderSchema } from '../enums/SortOrderEnum.ts';
import { dateSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';

/** Десятичные суммы в DOC передаются как string($decimal). */
export const inventorizationDecimalStringSchema = z
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
  inventoryOrderId: zIdSchema.optional().describe('ИД приказа инвентаризации'),
  accountSurrogateId: zIdSchema.optional().describe('Суррогатный ключ счёта'),
  accountTypeId: zIdSchema.optional().describe('Тип счёта (одиночный id)'),
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
}).describe('Фильтр для списка счетов');

/** Тело POST …/accounts/list — как `getTasksRequestSchema` в report-6406. */
export const getInventoryAccountsListRequestSchema = z.object({
  pagination: paginationQuerySchema.describe('Параметры пагинации'),
  sorting: inventoryAccountsListSortingSchema.describe('Параметры сортировки (колонка — фиксированный набор)'),
  filter: inventoryAccountsListFilterSchema,
});

/**
 * Строка списка / деталь счёта — полный атрибутный состав ответа DOC (раздел 3.1),
 * `accountSurrogateKey` → `accountSurrogateId`, `accountNum` → `accountNumber`.
 */
export const inventoryAccountRowSchema = z.object({
  id: zIdSchema.describe('ИД записи в реестре'),
  accountSurrogateId: zIdSchema.describe('Суррогатный ключ счёта (DOC: accountSurrogateKey)'),
  accountNumber: z.string().optional().describe('Номер счёта (DOC: accountNum)'),
  accountOpenDate: dateSchema.optional(),
  accountType: zIdSchema.optional(),
  clientName: z.string().optional(),
  agreementNum: z.string().optional(),
  originalUnit: z.string().optional(),
  bs2: zIdSchema.optional(),
  accountName: z.string().optional(),
  lastOperationDate: dateSchema.optional(),
  agreementStatus: z.string().optional(),
  accountOutRubSum: inventorizationDecimalStringSchema.optional(),
  accountOutSum: inventorizationDecimalStringSchema.optional(),
  productCode: z.string().optional(),
  productName: z.string().optional(),
  manualControlRuleNumber: zIdSchema.optional(),
  manualControlFlag: z.boolean().optional(),
  inventoryAccountStatus: z.string().optional(),
  reversedDebitSumRub: inventorizationDecimalStringSchema.optional(),
  reversedDebitSum: inventorizationDecimalStringSchema.optional(),
  reversedCreditSumRub: inventorizationDecimalStringSchema.optional(),
  reversedCreditSum: inventorizationDecimalStringSchema.optional(),
  sourceBank: z.string().optional(),
  dataDate: dateSchema.optional(),
  currencyIsoCode: z.string().optional(),
  clientInn: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventorizationDecimalStringSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateSchema.optional(),
  manualUnit: z.string().optional(),
  updatedAt: z.iso.datetime().optional().describe('Для сортировки списка'),
});

export const inventoryAccountListItemSchema = inventoryAccountRowSchema;

export const inventoryAccountsListResponseSchema = z.object({
  items: z.array(inventoryAccountListItemSchema).describe('Список счетов'),
  totalItems: z.number().int().min(0).describe('Общее количество счетов'),
});

export const inventoryAccountDetailSchema = inventoryAccountRowSchema;

export const inventoryAccountHistoryItemSchema = z.object({
  id: zIdSchema,
  accountSurrogateId: zIdSchema.optional().describe('Суррогат счёта (DOC)'),
  changedAt: z.iso.datetime(),
  changedBy: z.string().optional(),
  fieldName: z.string().optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  /** Дополнительное поле; в DOC основной состав — fieldName / oldValue / newValue */
  action: z.string().optional(),
});

export const inventoryAccountHistoryResponseSchema = z.object({
  items: z.array(inventoryAccountHistoryItemSchema),
});

export const inventoryAccountSurrogateIdParamSchema = z.object({
  accountSurrogateId: zIdSchema,
});

/** POST …/manual-unit/:accountSurrogateId — тело (DOC: manualResponsibleUnit, force). */
export const inventoryManualUnitSingleRequestSchema = z.object({
  manualResponsibleUnit: z.string().optional(),
  force: z.boolean().optional(),
});

/** Массовая пометка ручного учёта: массив surrogate id в body. */
export const inventoryManualUnitBulkRequestSchema = z.object({
  accountSurrogateIds: z.array(zIdSchema).min(1),
  manualResponsibleUnit: z.string().optional(),
  force: z.boolean().optional(),
});

export const inventoryManualUnitResponseSchema = z.object({
  updated: z.number().int().min(0),
});

/** POST /accounts/inventory — полное тело по DOC. */
export const inventoryAccountsInventoryRequestSchema = z.object({
  inventoryOrderId: zIdSchema,
  accountSurrogateIds: z.array(zIdSchema).min(1).describe('DOC: accountSurrogateKeys'),
  manualInventoryAccountStatus: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventorizationDecimalStringSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateSchema.optional(),
});

export const inventoryAccountsInventoryExcludeRequestSchema = z.object({
  inventoryOrderId: zIdSchema,
  accountSurrogateIds: z.array(zIdSchema).min(1),
});

export const inventoryAccountsInventoryMutationResponseSchema = z.object({
  affected: z.number().int().min(0),
});

/** DOC: isVisible; в API сохраняем оба имени как optional (ренейминг). */
export const inventorizationAccountColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  isVisible: z.boolean().optional(),
  visible: z.boolean().optional(),
});

export const inventorizationAccountColumnsResponseSchema = z.object({
  columns: z.array(inventorizationAccountColumnSchema),
});

export const inventorizationAccountColumnsUpdateSchema = z.object({
  columns: z.array(inventorizationAccountColumnSchema),
});

/** DOC: accountSurrogateKeys + filter (объект фильтров списка). */
export const inventoryAccountsExportRequestSchema = z.object({
  accountSurrogateIds: z.array(zIdSchema).optional().describe('DOC: accountSurrogateKeys'),
  filter: inventoryAccountsListFilterSchema,
  inventoryOrderId: zIdSchema.optional(),
  format: z.enum(['xlsx', 'csv']).optional(),
});

export const inventoryAccountsExportResponseSchema = z.object({
  fileKey: z.string().optional(),
});
