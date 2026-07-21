import { z } from 'zod';

import { zUuidSchema } from '../common/uuid.schema.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { inventoryControlTypeSchema } from './enums/InventoryControlTypeEnum.ts';

export const inventoryInventoryOrderIdParamSchema = z.object({
  inventoryOrderId: zUuidSchema,
});

/** Элемент фильтра БС-2 */
export const inventoryBs2FilterItemSchema = z.object({
  id: zUuidSchema,
  bs2Name: z.number().int().positive().describe('Значение').min(1).max(99999)
});
export const inventoryBs2FilterResponseSchema = z.array(inventoryBs2FilterItemSchema);

export const inventoryAccountTypeFilterItemSchema = z.object({
  id: zUuidSchema,
  accountTypeName: z.number().int(),
});
export const inventoryAccountTypeFilterResponseSchema = z.array(inventoryAccountTypeFilterItemSchema);

export const inventoryResponsibleUnitFilterItemSchema = z.object({
  id: zUuidSchema,
  responsibleUnitName: z.string(),
});
export const inventoryResponsibleUnitFilterResponseSchema = z.array(inventoryResponsibleUnitFilterItemSchema);

export const inventoryResponsibleUnitTypeFilterItemSchema = z.object({
  id: zUuidSchema,
  responsibleUnitTypeName: z.string(),
});
export const inventoryResponsibleUnitTypeFilterResponseSchema = z.array(inventoryResponsibleUnitTypeFilterItemSchema);

export const inventoryAccountStatusFilterItemSchema = z.object({
  id: zIdSchema,
  inventoryAccountStatusName: z.string(),
});
export const inventoryAccountStatusFilterResponseSchema = z.array(inventoryAccountStatusFilterItemSchema);

export const inventoryAccountStatusGroupFilterItemSchema = z.object({
  inventoryAccountGroupId: zIdSchema,
  inventoryAccountGroupName: z.string(),
});

export const inventoryAccountStatusGroupFilterResponseSchema = z.array(inventoryAccountStatusGroupFilterItemSchema);

export const inventoryControlTypeFilterItemSchema = z.object({
  controlType: inventoryControlTypeSchema,
  controlTypeName: z.string(),
});

export const inventoryControlTypeFilterResponseSchema = z.array(inventoryControlTypeFilterItemSchema);

export const inventoryOrderFilterItemSchema = z.object({
  inventoryOrderId: zUuidSchema,
  orderName: z.string(),
  isActive: z.boolean(),
});
export const inventoryOrderFilterResponseSchema = z.array(inventoryOrderFilterItemSchema);

export const inventorySourceBankFilterItemSchema = z.object({
  id: zUuidSchema,
  sourceBankName: z.string(),
});
export const inventorySourceBankFilterResponseSchema = z.array(inventorySourceBankFilterItemSchema);

export const inventoryProductFilterItemSchema = z.object({
  id: zUuidSchema,
  productName: z.string(),
});
export const inventoryProductFilterResponseSchema = z.array(inventoryProductFilterItemSchema);

export const inventoryManualControlFilterItemSchema = z.object({
  id: zUuidSchema,
  manualControlRuleNumber: z.number().int(),
});
export const inventoryManualControlFilterResponseSchema = z.array(inventoryManualControlFilterItemSchema);

export const inventorySenderNamesFilterItemSchema = z.object({
  adLogin: z.string(),
  senderName: z.string(),
});

export const inventorySenderNamesFilterResponseSchema = z.array(inventorySenderNamesFilterItemSchema);
