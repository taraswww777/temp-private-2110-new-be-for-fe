import { z } from 'zod';

export enum InventoryStatisticsStatusEnum {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED  = 'FAILED',
}

export const inventoryStatisticsStatusSchema = z
  .enum(InventoryStatisticsStatusEnum)
  .describe('Статус формирования отчета');
