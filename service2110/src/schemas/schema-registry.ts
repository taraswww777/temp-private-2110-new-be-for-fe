/**
 * Реестр Zod-схем для автоматической генерации $ref в OpenAPI.
 *
 * Используется fastify-type-provider-zod: зарегистрированные здесь схемы
 * автоматически попадают в components.schemas и заменяются на $ref-ссылки
 * в описаниях роутов.
 *
 * Регистрация: common, report-6406 (IIFE в модулях), inventory.
 */

import { openApiRegistry } from './open-api-registry.ts';
import { registerCommonOpenApiSchemas } from './common/openapi-register.ts';
import { registerInventoryOpenApiSchemas } from './inventory/openapi-register.ts';

import './report-6406/openapi-register.ts';

export { openApiRegistry };

registerCommonOpenApiSchemas();
registerInventoryOpenApiSchemas();

export type { OpenApiSchemaRegistry } from '../types/openapi-schema-registry.ts';
