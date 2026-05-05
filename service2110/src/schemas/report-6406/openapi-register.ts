/**
 * Подключает все модули report-6406 с OpenAPI-регистрацией: IIFE в каждом файле выполняется при загрузке.
 * Новый файл схем: добавить сюда `import './your.schema.ts'`.
 */
import './enums/openapi-register.ts';
import './references.schema.ts';
import './tasks.schema.ts';
import './task-status-history.schema.ts';
import './task-files.schema.ts';
import './packages.schema.ts';
import './package-status-history.schema.ts';
import './export.schema.ts';
import './storage.schema.ts';
import './dictionary.schema.ts';

export type { OpenApiSchemaRegistry } from '../../types/openapi-schema-registry.ts';
export {
  registerReport6406EnumOpenApiSchema,
  registerReport6406OpenApiSchema,
} from './openapi-register-helpers.ts';
