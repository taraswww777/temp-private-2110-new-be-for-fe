import { z } from 'zod';

import { zUuidSchema } from '../common/uuid.schema.ts';

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
  id: zUuidSchema,
  inventoryAccountStatusName: z.string(),
});
export const inventoryAccountStatusFilterResponseSchema = z.array(inventoryAccountStatusFilterItemSchema);

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
