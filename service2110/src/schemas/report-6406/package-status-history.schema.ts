import { z } from 'zod';
import { packageStatusSchema } from './enums/PackageStatusEnum.ts';

import { zIdSchema } from '../common/id.schema.ts';

import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Схема для записи истории статуса пакета
 */
export const packageStatusHistoryItemSchema = z.object({
  id: zIdSchema,
  packageId: zIdSchema,
  packageStatus: packageStatusSchema,
  changedAt: z.iso.datetime().describe('Дата и время изменения'),
  changedBy: z.string().describe('Инициатор изменения. Логин или ФИО'),
  note: z.string().optional(),
});

export type PackageStatusHistoryItem = z.infer<typeof packageStatusHistoryItemSchema>;

/**
 * Схема для ответа с историей статусов пакета
 */
export const packageStatusHistoryResponseSchema = z.array(packageStatusHistoryItemSchema);

export type PackageStatusHistoryResponse = z.infer<typeof packageStatusHistoryResponseSchema>;

(function registerPackageStatusHistoryReport6406OpenApi() {
  registerReport6406OpenApiSchema(packageStatusHistoryItemSchema, 'PackageStatusHistoryItemDto');
  registerReport6406OpenApiSchema(packageStatusHistoryResponseSchema, 'PackageStatusHistoryResponseDto');
})();
