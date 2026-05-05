import { z } from 'zod';

import { openApiRegistry } from '../open-api-registry.ts';

/**
 * Регистрирует Zod-схему в общем {@link openApiRegistry} (`components.schemas[id]`).
 */
export function registerOpenApiComponent(schema: z.ZodType, componentId: string): void {
  openApiRegistry.add(schema, { id: componentId });
}
