import { z } from 'zod';

export enum InventoryEntityTypeEnum {
  REPORTS = 'REPORTS',
  ORDERS = 'ORDERS',
}

export const inventoryEntityTypeSchema = z.enum(InventoryEntityTypeEnum)
