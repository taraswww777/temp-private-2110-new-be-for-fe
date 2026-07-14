import { z } from 'zod';
import { sortOrderSchema } from '../common/SortOrderEnum.ts';
import { packageStatusSchema } from './enums/PackageStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { paginationQuerySchema } from '../common/pagination.schema.ts';
import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';
import { dateTimeSchema } from '../common/dateString.schema.ts';
import { tfrListSortColumnSchema } from './enums/TfrListSortColumnEnum.ts';


/**
 * Схема для ответа при копировании пакета в ТФР (POST /api/v1/report-6406/packages/{id}/copy-to-tfr).
 * Возвращает информацию об успешном копировании.
 */
export const copyToTfrResponseSchema = z.object({
  id: zIdSchema.describe('ИД пакета'),
  lastCopiedToTfrAt: dateTimeSchema.describe('Дата и время последнего копирования в ТФР, например 2026-04-30T12:20:50.979Z'),
  message: z.string().describe('Сообщение о результате операции'),
});

/**
 * Информация о пакете в TFR (PackTfrInfoDto).
 */
export const packTfrInfoSchema = z.object({
  packId: zIdSchema.describe('ИД пакета'),
  packName: z.string().max(255).describe('Имя пакета'),
  tfrCopyDate: z.string().max(255).describe('Дата копирования в TFR, например 2026-04-30T12:20:50.979Z'),
  size: z.number().int().min(0).describe('Размер пакета в мегабайтах').default(0),
});

/** Схема фильтрации для TFR (PackTfrFilterDto) */
export const packTfrFilterSchema = z.object({
  name: z.string().max(255).optional(),
  status: z.array(packageStatusSchema).optional(),
  copiedFrom: dateTimeSchema.optional(),
  copiedTo: dateTimeSchema.optional(),
}).describe('Фильтры для поиска пакетов в TFR');

/** Схема сортировки для TFR (PackSortingRequestDto) */
export const packTfrSortingSchema = z.object({
  sortOrder: sortOrderSchema.describe('Критерий сортировки: asc или desc'),
  sortBy: tfrListSortColumnSchema,
}).describe('Параметры сортировки для TFR');

/** Схема запроса на получение информации о пакетах в TFR (GetTfrInfoRequestDto) */
export const getTfrInfoRequestSchema = z.object({
  pagination: paginationQuerySchema,
  sorting: packTfrSortingSchema.optional(),
  filter: packTfrFilterSchema.optional(),
}).describe('Запрос на получение списка пакетов в TFR с фильтрацией, сортировкой и пагинацией');

/** Схема ответа (PacksTfrInfoListResponseDto) */
export const getTfrInfoResponseSchema = z.object({
  results: z.array(packTfrInfoSchema).describe('Список пакетов в TFR'),
  totalItems: z.number().int().min(0).describe('Общее количество пакетов'),
}).describe('Ответ с пагинированным списком пакетов в TFR');


(function registerPackagesReport6406OpenApi() {
  registerReport6406OpenApiSchema(packTfrFilterSchema, 'PackTfrFilterDto');
  registerReport6406OpenApiSchema(packTfrSortingSchema, 'PackSortingRequestDto');
  registerReport6406OpenApiSchema(getTfrInfoRequestSchema, 'GetTfrInfoRequestDto');
  registerReport6406OpenApiSchema(getTfrInfoResponseSchema, 'PacksTfrInfoListResponseDto');
  registerReport6406OpenApiSchema(copyToTfrResponseSchema, 'CopyToTfrResponseDto');
  registerReport6406OpenApiSchema(packTfrInfoSchema, 'PackTfrInfoDto');
})();
