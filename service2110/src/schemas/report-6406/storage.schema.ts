import { z } from 'zod';

import { storageCodeZodSchema } from './enums/StorageCodeEnum.ts';
import { registerReport6406OpenApiSchema } from './openapi-register-helpers.ts';

/**
 * Информация о хранилище (StorageResponse по новому OAS).
 */
export const storageResponseSchema = z.object({
  code: storageCodeZodSchema,
  totalSize: z.number().int().min(0).describe('Общий объём хранилища в Mb'),
  freeSize: z.number().int().min(0).describe('Свободный размер хранилища в Mb'),
  percent: z.number().min(0).describe('Процент заполнения (0–100)'),
});

export type StorageResponse = z.infer<typeof storageResponseSchema>;

/**
 * Ответ GET /storages/volume — массив хранилищ.
 */
export const storageVolumeListResponseSchema = z.array(storageResponseSchema);

export type StorageVolumeListResponse = z.infer<typeof storageVolumeListResponseSchema>;

/** @deprecated используйте storageResponseSchema */
export const storageVolumeItemSchema = storageResponseSchema;

export type StorageVolumeItem = z.infer<typeof storageVolumeItemSchema>;

/**
 * Роль пользователя с назначениями.
 */
export const userRoleAssignmentSchema = z.object({
  role: z.string().describe('Имя роли'),
  assignments: z.array(z.string()).describe('Список назначений роли'),
});

export type UserRoleAssignment = z.infer<typeof userRoleAssignmentSchema>;

/**
 * Ответ GET /user/roles — список ролей пользователя.
 */
export const userRoleResponseSchema = z.object({
  login: z.string().describe('Логин пользователя'),
  roleAssignments: z.array(userRoleAssignmentSchema).describe('Список ролей и их назначений'),
});

export type UserRoleResponse = z.infer<typeof userRoleResponseSchema>;

export const userRoleListResponseSchema = z.array(userRoleResponseSchema);

export type UserRoleListResponse = z.infer<typeof userRoleListResponseSchema>;

(function registerStorageReport6406OpenApi() {
  registerReport6406OpenApiSchema(storageResponseSchema, 'StorageResponse');
  registerReport6406OpenApiSchema(storageVolumeListResponseSchema, 'StorageVolumeListResponseDto');
  registerReport6406OpenApiSchema(userRoleResponseSchema, 'UserRoleResponse');
  registerReport6406OpenApiSchema(userRoleListResponseSchema, 'UserRoleListResponseDto');
})();
