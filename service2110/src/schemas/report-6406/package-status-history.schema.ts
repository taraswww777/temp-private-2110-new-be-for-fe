import { z } from 'zod';
import { packetStatusSchema } from '../enums/PackageStatusEnum.ts';
import { zIdSchema } from '../common.schema.ts';

/**
 * Схема для записи истории статуса пакета
 */
export const packageStatusHistoryItemSchema = z.object({
  id: zIdSchema,
  packageId: zIdSchema,
  packageStatus: packetStatusSchema,
  changeAt: z.iso.datetime().describe('Дата и время изменения'),
  changeBy: z.string().describe('Инициатор изменения. Логин или ФИО'),
  note: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional().describe('Дополнительные метаданные в формате ключ-значение'),
});

export type PackageStatusHistoryItem = z.infer<typeof packageStatusHistoryItemSchema>;

/**
 * Схема для ответа с историей статусов пакета
 */
export const packageStatusHistoryResponseSchema = z.array(packageStatusHistoryItemSchema);

export type PackageStatusHistoryResponse = z.infer<typeof packageStatusHistoryResponseSchema>;
