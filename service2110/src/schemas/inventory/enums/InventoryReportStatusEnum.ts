import { z } from 'zod';

export enum InventoryReportStatusEnum {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED  = 'FAILED',
  CONTINUED = 'CONTINUED',
  ROW_LIMIT_EXCEEDED = 'ROW_LIMIT_EXCEEDED',
}

export const inventoryReportStatusSchema = z
  .enum(InventoryReportStatusEnum)
  .describe('Статус формирования отчета');


