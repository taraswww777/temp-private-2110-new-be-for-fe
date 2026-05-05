import { z } from 'zod';

/**
 * Единый экземпляр реестра Zod → OpenAPI (`fastify-type-provider-zod`).
 * Отдельный файл без побочных импортов — схемы могут регистрироваться здесь без циклов.
 */
export const openApiRegistry = z.registry<{ id: string }>();
