import { z } from 'zod';

export enum InventoryControlTypeEnum {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export const inventoryControlTypeSchema = z.enum(InventoryControlTypeEnum)
