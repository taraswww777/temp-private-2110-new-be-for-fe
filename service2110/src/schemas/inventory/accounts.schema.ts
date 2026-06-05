import { z } from 'zod';

import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { dateTimeSchema } from '../common/dateString.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryReportExportItemSchema } from './inventory-common.schema.ts';

export const inventoryDecimalSchema = z
  .number()
  .describe('Десятичное значение');

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
  isUnitChanged: z.boolean().optional().describe('Флаг фильтра "Была смена ОП"'),
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
  accountId: zUuidSchema,
  accountNum: z.string().optional().describe('Номер счёта (DOC: accountNum)'),
  accountOpenDate: dateTimeSchema.optional(),
  accountType: zIdSchema.optional(),
  clientName: z.string().optional(),
  agreementNum: z.string().optional(),
  originalResponsibleUnit: z.string().optional(),
  bs2: zIdSchema.optional(),
  accountName: z.string().optional(),
  lastOperationDate: dateTimeSchema.optional(),
  agreementStatus: z.string().optional(),
  accountOutRubSum: inventoryDecimalSchema.optional(),
  accountOutSum: inventoryDecimalSchema.optional(),
  productCode: z.string().optional(),
  productName: z.string().optional(),
  manualControlRuleNumber: zIdSchema.optional(),
  manualControlFlag: z.boolean().optional(),
  inventoryAccountStatus: z.string().optional(),
  sourceBank: z.string().optional(),
  currencyIsoCode: z.string().optional(),
  clientInn: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateTimeSchema.optional(),
  responsibleUnit: z.string().optional().describe('Подразделение, ответственное по счёту'),
  version: zIdSchema,
  isExclude: z.boolean().optional(),
  filialCbrName: z.string().optional().describe('Наименование филиала'),
  filialCbrNumber: z.string().optional().describe('Код филиала по ЦБ'),
  liquidatedFlag: z.boolean().optional().describe('Статус клиента. true  - Ликвидирован, false - Автоматическая сверка'),
  inventoryUpdatedBy: z.string().optional().describe('ФИО сотрудника, кто последний обновлял параметры инвентаризации, в том числе и статус инвентаризации'),
  inventoryUpdatedAt: dateTimeSchema.optional().describe('Дата установки конечного статуса инвентаризации во соответствии со статусной моделью: «Без расхождений», «С урегулированием расхождений»'),
  srcCd: z.string().optional().describe('Система-источник счета'),
});

export const inventoryAccountListItemSchema = inventoryAccountRowSchema;

export const inventoryAccountsListResponseSchema = z.object({
  itemsList: z.array(inventoryAccountListItemSchema).describe('Список счетов'),
  totalItems: z.number().int().min(0).describe('Общее количество счетов'),
});

export const inventoryAccountDetailSchema = inventoryAccountRowSchema;

export const inventoryAccountHistoryItemSchema = z.object({
  changeDate:dateTimeSchema,
  changedBy: z.string(),
  manualInventoryAccountStatus: z.string().optional(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateTimeSchema.optional(),
  responsibleUnit: z.string().optional().describe('Подразделение, ответственное по счёту'),
  isExclude: z.boolean().optional(),
});

export const inventoryAccountHistoryRequestSchema = z.object({
   pagination: paginationQuerySchema,
})

export const inventoryAccountHistoryResponseSchema = z.object({
  itemsList: z.array(inventoryAccountHistoryItemSchema),
  totalItems: z.number().int().min(0),
  nextElement: inventoryAccountHistoryItemSchema.optional(),
});

export const inventoryAccountIdParamSchema = z.object({
  accountId: zUuidSchema,
});


export const inventoryAccountIdsSchema = z.object({
  accountId: z.array(zUuidSchema).min(1),
});

export const inventoryManualUnitRequestSchema = z.object({
  manualResponsibleUnit: z.string().optional(),
  isForce: z.boolean().optional(),
  version: zIdSchema,
});

export const inventoryAccountsExportRequestSchema = z.object({
  accountIds: z.array(zUuidSchema).optional(),
  filters: inventoryAccountsListFilterSchema.optional(),
});

export const inventoryAccountsExportResponseSchema =  z.array(inventoryReportExportItemSchema);

export const inventoryAccountStatusSingleRequestSchema = z.object({
  manualInventoryAccountStatus: z.string(),
  discrepancyDescription: z.string().optional(),
  discrepancySum: inventoryDecimalSchema.optional(),
  discrepancyReason: z.string().optional(),
  resolutionActions: z.string().optional(),
  resolutionDate: dateTimeSchema.optional(),
  version: zIdSchema,
}).describe('Установка статуса и параметров инвентаризации');
export const inventoryAccountStatusSingleSchema = inventoryAccountStatusSingleRequestSchema.extend({
  accountId: zUuidSchema,
}).describe('Данные о статусе и параметрах инвентаризации для конкретного счета');

export const accountVersionedIdSchema = z.object({
   accountId: zUuidSchema,
   version: zIdSchema,
});

export const accountVersionedIdsSchema =  z.array(accountVersionedIdSchema);

export const inventoryAccountUpdatedResponseSchema = z.object({
   updatedCount: z.number().int().min(0),
});

export const inventoryManualUnitBulkRequestSchema = z.object({
  manualResponsibleUnit: z.string().optional(),
  isForce: z.boolean().optional(),
  accounts: accountVersionedIdsSchema,
})