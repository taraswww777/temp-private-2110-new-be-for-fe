/**
 * Реестр Zod-схем для автоматической генерации $ref в OpenAPI.
 *
 * Используется fastify-type-provider-zod: зарегистрированные здесь схемы
 * автоматически попадают в components.schemas и заменяются на $ref-ссылки
 * в описаниях роутов.
 *
 * Регистрация: common, report-6406, inventorization.
 */

import { z } from 'zod';

import { registerReport6406OpenApiSchemas } from './report-6406/openapi-register.ts';
import { registerInventorizationOpenApiSchemas } from './inventorization/openapi-register.ts';
import { registerCommonOpenApiSchemas } from './common/openapi-register.ts';

export const openApiRegistry = z.registry<{ id: string }>();

registerCommonOpenApiSchemas(openApiRegistry);
registerReport6406OpenApiSchemas(openApiRegistry);
registerInventorizationOpenApiSchemas(openApiRegistry);

export type { OpenApiSchemaRegistry } from './report-6406/openapi-register.ts';
