import { z } from 'zod';

/** Реестр Zod-схем с метаданными OpenAPI (`registry.add(..., { id })`). */
export type OpenApiSchemaRegistry = ReturnType<typeof z.registry<{ id: string }>>;
