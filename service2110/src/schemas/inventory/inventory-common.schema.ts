import { z } from 'zod';

import { inventoryProcessStatusSchema } from './enums/InventoryProcessStatusEnum.ts';
import { dateTimeSchema } from '../common/dateString.schema.ts';
import { zUuidSchema } from '../common/uuid.schema.ts';
import { inventoryAssignmentsSchema, inventoryReportStatusSchema, inventoryUserRolesSchema } from './enums/InventoryReportStatusEnum.ts';
import { zIdSchema } from '../common/id.schema.ts';
import { inventoryEntityTypeSchema } from './enums/InventoryEntityTypeEnum.ts';

export const inventoryInventoryStateQuerySchema = z.object({
  inventoryOrderId: zUuidSchema.optional(),
});

export const inventoryFileSchema = z.object({
  entityId: zUuidSchema.optional(),
  entityType: inventoryEntityTypeSchema.optional(),
});

export { inventoryProcessStatusSchema };

export const inventoryInventoryStateResponseSchema = z.object({
  inventoryOrderId: zUuidSchema.optional(),
  orderNumber: z.string().optional(),
  orderDate: dateTimeSchema.optional(),
  inventoryDateFrom: dateTimeSchema.optional(),
  inventoryDateTo: dateTimeSchema.optional(),
  isActive: z.boolean().optional(),
  status: inventoryProcessStatusSchema.optional(),
});

export const inventoryColumnsQuerySchema = z.object({
  tableName: z.string(),
})

export const inventoryColumnsUpdateSchema = z.object({
  tableName: z.string(),
  columnName: z.string(),
  isVisible: z.boolean(),
});

export const inventoryColumnSchema = z.object({
  columnName: z.string(),
  isVisible: z.boolean(),
});

export const inventoryColumnsResponseSchema = z.array(inventoryColumnSchema);

export const inventoryExportParamsSchema = z.object({
  bs2: z.array(zIdSchema).optional().describe('Балансовый Счёт Второго Порядка"'),
  accountNum: z.string().optional(),
  accountType: z.array(zIdSchema).optional(),
  responsibleUnit: z.array(z.string()).optional(),
  responsibleUnitType: z.array(z.string()).optional(),
  inventoryAccountStatus: z.array(z.string()).optional(),
  sourceBank: z.array(z.string()).optional(),
  productName: z.array(z.string()).optional(),
  manualControlRuleNumber: z.array(zIdSchema).optional(),
  showZeroBalanceAccounts: z.boolean().optional(),
  isExclude: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export const inventoryReportExportItemSchema = z.object({
  id: zUuidSchema,
  fullName: z.string(),
  exportParams: inventoryExportParamsSchema,
  filePath: z.string(),
  status: inventoryReportStatusSchema.optional(),
  createdAt: dateTimeSchema.optional(),
});

export const inventoryActiveStateSchema = z.object({
  status: inventoryProcessStatusSchema,
});

export const inventoryRoleAssignmentSchema = z.object({
  role: inventoryUserRolesSchema,
  assignments: z.array(inventoryAssignmentsSchema),
})

export const inventoryUserRolesResponseSchema = z.object({
  login: z.string(),
  roleAssignments: z.array(inventoryRoleAssignmentSchema).optional(),
});