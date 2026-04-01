import { z } from 'zod';

import { zIdSchema } from '../common/id.schema.ts';

export const inventoryInventoryOrderIdParamSchema = z.object({
  inventoryOrderId: zIdSchema,
});

/** Элемент фильтра БС-2 */
export const inventoryBs2FilterItemSchema = z.object({
  id: zIdSchema,
  bs2Name: z.number().int().positive().describe('Значение').min(1).max(99999)
});
export const inventoryBs2FilterResponseSchema = z.array(inventoryBs2FilterItemSchema);

export const inventoryAccountTypeFilterItemSchema = z.object({
  id: zIdSchema,
  accountTypeName: z.number().int(),
});
export const inventoryAccountTypeFilterResponseSchema = z.array(inventoryAccountTypeFilterItemSchema);

export const inventoryResponsibleUnitFilterItemSchema = z.object({
  id: zIdSchema,
  responsibleUnitName: z.string(),
});
export const inventoryResponsibleUnitFilterResponseSchema = z.array(inventoryResponsibleUnitFilterItemSchema);

export const inventoryResponsibleUnitTypeFilterItemSchema = z.object({
  id: zIdSchema,
  responsibleUnitTypeName: z.string(),
});
export const inventoryResponsibleUnitTypeFilterResponseSchema = z.array(inventoryResponsibleUnitTypeFilterItemSchema);

export const inventoryAccountStatusFilterItemSchema = z.object({
  id: zIdSchema,
  inventoryAccountStatusName: z.string(),
});
export const inventoryAccountStatusFilterResponseSchema = z.array(inventoryAccountStatusFilterItemSchema);

export const inventorySourceBankFilterItemSchema = z.object({
  id: zIdSchema,
  sourceBankName: z.string(),
});
export const inventorySourceBankFilterResponseSchema = z.array(inventorySourceBankFilterItemSchema);

export const inventoryProductFilterItemSchema = z.object({
  id: zIdSchema,
  productName: z.string(),
});
export const inventoryProductFilterResponseSchema = z.array(inventoryProductFilterItemSchema);

export const inventoryManualControlFilterItemSchema = z.object({
  id: zIdSchema,
  manualControlRuleNumber: z.number().int(),
});
export const inventoryManualControlFilterResponseSchema = z.array(inventoryManualControlFilterItemSchema);
