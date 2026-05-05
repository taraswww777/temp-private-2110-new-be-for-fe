import { z } from 'zod';

import { registerOpenApiComponent } from '../utils/registerOpenApiComponent.ts';

/** DTO и прочие object-схемы report-6406. */
export function registerReport6406OpenApiSchema(schema: z.ZodType, componentId: string): void {
  registerOpenApiComponent(schema, componentId);
}

/**
 * Перечисления report-6406. `enumComponentId` — ключ в `swaggerExtendedEnumJsonSchemas`.
 */
export function registerReport6406EnumOpenApiSchema(schema: z.ZodType, enumComponentId: string): void {
  registerOpenApiComponent(schema, enumComponentId);
}
