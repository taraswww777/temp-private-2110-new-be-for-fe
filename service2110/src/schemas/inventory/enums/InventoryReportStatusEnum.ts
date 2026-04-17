import { z } from 'zod';

export enum InventoryReportStatusEnum {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED  = 'FAILED',
}

export const inventoryReportStatusSchema = z
  .enum(InventoryReportStatusEnum)
  .describe('Статус формирования отчета');
