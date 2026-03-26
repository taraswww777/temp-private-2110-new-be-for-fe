import { FastifyBaseLogger, FastifyInstance } from 'fastify';
import * as http from 'node:http';
import { IncomingMessage, ServerResponse } from 'node:http';
import {
  ZodTypeProvider,
  createJsonSchemaTransform,
  createJsonSchemaTransformObject,
} from 'fastify-type-provider-zod';
import type { SwaggerTransformObject } from '@fastify/swagger';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { join } from 'path';
import { writeFileSync } from 'fs';

import { env } from '../../config/env.ts';
import { openApiRegistry } from '../../schemas/schema-registry.ts';
import { PackageStatusEnumSchema } from '../../schemas/report-6406/enums/PackageStatusEnum.ts';
import { FileStatusEnumSwaggerSchema } from '../../schemas/report-6406/enums/FileStatusEnum.ts';
import { ReportTypeEnumSchema } from '../../schemas/report-6406/enums/ReportTypeEnum.ts';
import { SortOrderEnumSchema } from '../../schemas/common/SortOrderEnum.ts';
import { CurrencyEnumSchema } from '../../schemas/report-6406/enums/CurrencyEnum.ts';
import { FileFormatEnumSchema } from '../../schemas/report-6406/enums/FileFormatEnum.ts';
import { TaskStatusEnumSchema } from '../../schemas/report-6406/enums/TaskStatusEnum.ts';
import { StorageCodeEnumSwaggerSchema } from '../../schemas/report-6406/enums/StorageCodeEnum.ts';
import { InventoryProcessStatusEnumSchema } from '../../schemas/inventorization/enums/InventoryProcessStatusEnum.ts';

type CustomFastifyInstance = FastifyInstance<
  http.Server<typeof IncomingMessage, typeof ServerResponse>,
  http.IncomingMessage,
  http.ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

/**
 * JSON Schema из `createEnumSchemaWithDescriptions` по имени компонента в OpenAPI.
 * Имя ключа должно совпадать с `registry.add(..., { id: '...' })` в openapi-register.
 * Библиотека генерирует базовый `{ type, enum }`, а transform ниже подмешивает
 * x-enum-descriptions, x-enum-varnames и oneOf.
 */
const swaggerExtendedEnumJsonSchemas: Record<string, Record<string, unknown>> = {
  PackageStatusEnum: PackageStatusEnumSchema,
  FileStatusEnum: FileStatusEnumSwaggerSchema,
  ReportTypeEnum: ReportTypeEnumSchema,
  SortOrderEnum: SortOrderEnumSchema,
  CurrencyEnum: CurrencyEnumSchema,
  FileFormatEnum: FileFormatEnumSchema,
  TaskStatusEnum: TaskStatusEnumSchema,
  StorageCodeEnum: StorageCodeEnumSwaggerSchema,
  InventoryProcessStatusEnum: InventoryProcessStatusEnumSchema,
};

const enumExtensions: Record<string, Record<string, unknown>> = Object.fromEntries(
  Object.entries(swaggerExtendedEnumJsonSchemas).map(([name, schema]) => [
    name,
    extractEnumExtensions(schema),
  ]),
);

function extractEnumExtensions(schema: Record<string, unknown>) {
  const ext: Record<string, unknown> = {};
  if (schema['x-enum-descriptions']) ext['x-enum-descriptions'] = schema['x-enum-descriptions'];
  if (schema['x-enum-varnames']) ext['x-enum-varnames'] = schema['x-enum-varnames'];
  if (schema.oneOf) ext.oneOf = schema.oneOf;
  return ext;
}

const DOCS_SKIP_LIST = [
  '/docs/',
  '/docs/initOAuth',
  '/docs/json',
  '/docs/uiConfig',
  '/docs/yaml',
  '/docs/*',
  '/docs/static/*',
];

/**
 * transformObject-обёртка: вызывает библиотечный createJsonSchemaTransformObject,
 * затем обогащает enum-схемы расширениями (x-enum-descriptions и т.д.)
 */
function createEnhancedTransformObject(): SwaggerTransformObject {
  const baseTransformObject = createJsonSchemaTransformObject({
    schemaRegistry: openApiRegistry,
  });

  return (input) => {
    const result = baseTransformObject(input);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = result as any;
    if (!doc.components?.schemas) {
      return result;
    }

    const schemas = doc.components.schemas;

    // Collapse *Input schemas: keep output version, promote input if no output exists
    const inputKeys = Object.keys(schemas).filter((k) => k.endsWith('Input'));
    for (const inputKey of inputKeys) {
      const baseName = inputKey.slice(0, -'Input'.length);
      if (!schemas[baseName]) {
        schemas[baseName] = schemas[inputKey];
      }
      delete schemas[inputKey];
    }

    // Enrich enum schemas with x-enum-descriptions, x-enum-varnames, oneOf
    for (const [baseName, ext] of Object.entries(enumExtensions)) {
      if (schemas[baseName]) {
        Object.assign(schemas[baseName], ext);
      }
    }

    // Rewrite all $ref URIs that pointed to *Input schemas
    let json = JSON.stringify(result);
    for (const inputKey of inputKeys) {
      const baseName = inputKey.slice(0, -'Input'.length);
      json = json.replaceAll(
        `#/components/schemas/${inputKey}`,
        `#/components/schemas/${baseName}`,
      );
    }

    return JSON.parse(json);
  };
}

export const registerFastifySwagger = async (app: CustomFastifyInstance) => {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Backend API',
        description: 'API документация для Backend проекта на Fastify + TypeScript + PostgreSQL\n\n## Глоссарий терминов\n\n- **ТФР (Территориальный финансовый репозиторий)** - централизованное хранилище финансовых отчётов\n- **DAPP** - Data Application Processing - система обработки данных\n- **FC** - File Conversion - система конвертации файлов',
        version: '2.0.0',
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
        {
          url: 'https://api-stage.example.com',
          description: 'Staging server',
        },
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Report 6406 - Dictionary', description: 'Справочники для формы отчётности 6406' },
        { name: 'Report 6406 - Tasks', description: 'Задания на построение отчётов для формы 6406' },
        { name: 'Report 6406 - Packages', description: 'Пакеты заданий для формы 6406' },
        { name: 'Report 6406 - Storage', description: 'Мониторинг хранилища отчётов' },
        { name: 'Inventorization', description: 'Инвентаризация (uaod-si-inventory, API-28)' },
        { name: 'Inventorization - Dictionary', description: 'Словари фильтров инвентаризации' },
        { name: 'Inventorization - Accounts', description: 'Счета инвентаризации' },
        { name: 'Inventorization - Statistics', description: 'Статистика инвентаризации' },
      ],
    },
    transform: createJsonSchemaTransform({
      skipList: DOCS_SKIP_LIST,
      schemaRegistry: openApiRegistry,
    }),
    transformObject: createEnhancedTransformObject(),
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    theme: {
      css: [
        {
          filename: 'theme-toggle.css',
          content: [
            '.theme-toggle-btn{position:fixed;top:10px;right:10px;z-index:9999;padding:8px 14px;',
            'border-radius:8px;border:1px solid rgba(255,255,255,.2);cursor:pointer;font-size:13px;',
            'background:rgba(0,0,0,.15);color:rgba(255,255,255,.95);font-family:inherit;box-shadow:0 1px 3px rgba(0,0,0,.2)}',
            '.theme-toggle-btn:hover{background:rgba(0,0,0,.25);color:#fff}',
            'html:not(.dark-mode) .theme-toggle-btn{border-color:rgba(0,0,0,.2);background:rgba(0,0,0,.06);color:#1a1a1a}',
            'html:not(.dark-mode) .theme-toggle-btn:hover{background:rgba(0,0,0,.1);color:#000}',
          ].join(''),
        },
      ],
      js: [
        {
          filename: 'theme-toggle.ts',
          content: [
            "(function(){var k='swagger-ui-theme';var d=localStorage.getItem(k)!=='light';",
            "document.documentElement.classList.toggle('dark-mode',d);",
            "function u(){var d=document.documentElement.classList.contains('dark-mode');",
            "btn.textContent=d?'Светлая тема':'Тёмная тема';}",
            "var btn=document.createElement('button');btn.type='button';btn.className='theme-toggle-btn';u();",
            "btn.onclick=function(){document.documentElement.classList.toggle('dark-mode');",
            "localStorage.setItem(k,document.documentElement.classList.contains('dark-mode')?'dark':'light');u();};",
            "document.body.appendChild(btn);})();",
          ].join(''),
        },
      ],
    },
  });

  app.addHook('onReady', async () => {
    const swaggerJson = app.swagger();

    if (swaggerJson.paths && typeof swaggerJson.paths === 'object') {
      const paths = swaggerJson.paths as Record<string, unknown>;
      const newPaths: Record<string, unknown> = {};

      for (const [path, pathItem] of Object.entries(paths)) {
        const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
        newPaths[normalizedPath] = pathItem;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (swaggerJson as any).paths = newPaths;
    }

    const swaggerPath = join(process.cwd(), 'docs', 'swagger', 'service2110.json');
    writeFileSync(swaggerPath, JSON.stringify(swaggerJson, null, 2));
    app.log.info(`Swagger JSON saved to ${swaggerPath}`);
  });
};
