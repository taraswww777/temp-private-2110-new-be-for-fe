import { z } from 'zod';
import { reportTaskStatusSchema } from './tasks.schema';
import { zIdSchema } from '../common.schema';
import { packetStatusSchema } from '../enums/PacketStatusEnum';

/**
 * Схема для записи истории статуса пакета
 */
export const packageStatusHistoryItemSchema = z.object({
  status: packetStatusSchema,
  changedAt: z.iso.datetime(),
  changedBy: z.string().nullable(),
});

export type PackageStatusHistoryItem = z.infer<typeof packageStatusHistoryItemSchema>;

/**
 * Схема для ответа с историей статусов пакета
 */
export const packageStatusHistoryResponseSchema = z.array(packageStatusHistoryItemSchema);

export type PackageStatusHistoryResponse = z.infer<typeof packageStatusHistoryResponseSchema>;
