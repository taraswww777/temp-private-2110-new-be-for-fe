import { z } from 'zod';

export enum InventoryEntityTypeEnum {
  ACCOUNTS = 'ACCOUNTS',
  STATISTICS = 'STATISTICS',
  ORDERS = 'ORDERS',
}

export const inventoryEntityTypeSchema = z.enum(InventoryEntityTypeEnum)
