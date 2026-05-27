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

export enum InventoryUserRolesEnum {
  INVENTORY = "Inventory",
  REPORTS = "6406u",
}

export const inventoryUserRolesSchema = z.enum(InventoryUserRolesEnum);

export enum InventoryAssignmentsEnum {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}

export const inventoryAssignmentsSchema = z.enum(InventoryAssignmentsEnum);