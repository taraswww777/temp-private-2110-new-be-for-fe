import { z } from 'zod';

export enum UserRolesEnum {
  INVENTORY = "Inventory",
  REPORTS = "6406u",
}

export const userRolesSchema = z.enum(UserRolesEnum);

export enum AssignmentsEnum {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
  UAOD_DOPB = "UAOD_DOPB",
}

export const assignmentsSchema = z.enum(AssignmentsEnum);

export const roleAssignmentSchema = z.object({
  role: userRolesSchema,
  assignments: z.array(assignmentsSchema),
})

export const userRolesResponseSchema = z.object({
  login: z.string(),
  roleAssignments: z.array(roleAssignmentSchema).optional(),
});