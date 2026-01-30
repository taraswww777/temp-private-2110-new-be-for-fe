import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { env } from './config/env.js';
import { routes } from './routes/index.js';
import { errorHandler } from './plugins/error-handler.js';
import userContextPlugin from './plugins/user-context.js';
import { getOpenApiComponents } from './schemas/openapi-components.js';
import { getSchemaName, schemaRegistry } from './schemas/schema-registry.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport: env.NODE_ENV === 'development' 
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  }).withTypeProvider<ZodTypeProvider>();

  // Установка валидаторов Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Настройка обработки ошибок валидации в формате RFC 7807
  app.setErrorHandler((error: Error, request, reply) => {
    // Обработка ошибок валидации Fastify
    if ('validation' in error && (error as { validation?: unknown }).validation) {
      return reply.status(400).send({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Request validation failed',
        instance: request.url,
        errors: ((error as { validation: Array<{ instancePath?: string; params?: { missingProperty?: string }; message?: string }> }).validation).map((err) => ({
          path: err.instancePath || err.params?.missingProperty || 'unknown',
          message: err.message || 'Validation error',
        })),
      });
    }

    // Передаем остальные ошибки в глобальный обработчик
    throw error;
  });

  // CORS плагин - разрешаем все запросы с localhost
  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      // Разрешаем запросы без origin (например, Postman, curl)
      if (!origin) {
        cb(null, true);
        return;
      }

      // Разрешаем localhost и 127.0.0.1 с любым портом
      const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      if (localhostPattern.test(origin)) {
        cb(null, true);
        return;
      }

      // Запрещаем остальные origins
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  // Регистрация обработчика ошибок
  await app.register(errorHandler);

  // Регистрация плагина для контекста пользователя
  await app.register(userContextPlugin);

  // Swagger плагин (OpenAPI 3.1)
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
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
        { name: 'Report 6406 - References', description: 'Справочники для формы отчётности 6406' },
        { name: 'Report 6406 - Tasks', description: 'Задания на построение отчётов для формы 6406' },
        { name: 'Report 6406 - Packages', description: 'Пакеты заданий для формы 6406' },
        { name: 'Report 6406 - Storage', description: 'Мониторинг хранилища отчётов' },
      ],
      components: {
        schemas: (() => {
          // Получаем компоненты и применяем рекурсивную обработку
          const components = getOpenApiComponents();
          
          // Функция для нормализации JSON Schema для сравнения (в т.ч. типизация items в массивах)
          const normalizeForComparison = (schema: unknown): string | null => {
            if (!schema || typeof schema !== 'object') {
              return null;
            }
            
            const s = schema as Record<string, unknown>;
            
            // Для массивов — учитываем тип элементов, чтобы не сливать TasksListResponseDto с PaginatedResponseDto
            if (s.type === 'array') {
              const itemsNorm = s.items ? normalizeForComparison(s.items) : null;
              const ref = (s.items && typeof s.items === 'object' && '$ref' in (s.items as object))
                ? (s.items as { $ref: string }).$ref
                : null;
              return JSON.stringify({ type: 'array', items: itemsNorm ?? ref ?? 'any' });
            }
            
            // Для объектов
            if (s.type === 'object') {
              const props = s.properties as Record<string, unknown> | undefined;
              if (!props) {
                return null;
              }
              
              const propertyTypes: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(props)) {
                if (value && typeof value === 'object') {
                  const prop = value as Record<string, unknown>;
                  if (prop.type === 'array') {
                    const itemsNorm = prop.items ? normalizeForComparison(prop.items) : null;
                    const ref = (prop.items && typeof prop.items === 'object' && '$ref' in (prop.items as object))
                      ? (prop.items as { $ref: string }).$ref
                      : null;
                    propertyTypes[key] = { type: 'array', items: itemsNorm ?? ref ?? 'any' };
                  } else {
                    propertyTypes[key] = {
                      type: prop.type,
                      format: prop.format,
                      enum: prop.enum ? (Array.isArray(prop.enum) ? prop.enum.slice().sort() : prop.enum) : undefined,
                    };
                  }
                }
              }
              const normalized: Record<string, unknown> = {
                type: 'object',
                propertyKeys: Object.keys(props).sort(),
                propertyTypes,
                required: Array.isArray(s.required) ? (s.required as string[]).slice().sort() : [],
                additionalProperties: s.additionalProperties,
              };
              return JSON.stringify(normalized);
            }
            
            // Для простых типов (string, number и т.д.)
            if (s.type === 'string' || s.type === 'number' || s.type === 'integer' || s.type === 'boolean') {
              const normalized: Record<string, unknown> = {
                type: s.type,
                format: s.format,
                pattern: s.pattern,
                enum: s.enum ? (Array.isArray(s.enum) ? (s.enum as unknown[]).slice().sort() : s.enum) : undefined,
                minimum: s.minimum,
                maximum: s.maximum,
              };
              
              return JSON.stringify(normalized);
            }
            
            return null;
          };
          
          // Функция для сравнения JSON Schema объектов
          const compareJsonSchemas = (schema1: unknown, schema2: unknown): boolean => {
            const normalized1 = normalizeForComparison(schema1);
            const normalized2 = normalizeForComparison(schema2);
            
            if (!normalized1 || !normalized2) {
              return false;
            }
            
            return normalized1 === normalized2;
          };
          
          // Функция для рекурсивной замены вложенных объектов на $ref ссылки
          const replaceNestedSchemas = (jsonSchema: unknown, registeredSchemas: Record<string, unknown>): unknown => {
            if (!jsonSchema || typeof jsonSchema !== 'object') {
              return jsonSchema;
            }
            
            const schema = jsonSchema as Record<string, unknown>;
            
            if (schema.$ref) {
              return schema;
            }
            
            // Сначала рекурсивно обрабатываем вложенные объекты
            if (schema.properties && typeof schema.properties === 'object') {
              const newProperties: Record<string, unknown> = {};
              for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
                newProperties[key] = replaceNestedSchemas(value, registeredSchemas);
              }
              schema.properties = newProperties;
            }
            
            if (schema.items) {
              schema.items = replaceNestedSchemas(schema.items, registeredSchemas);
            }
            
            if (Array.isArray(schema.anyOf)) {
              schema.anyOf = schema.anyOf.map((item: unknown) => replaceNestedSchemas(item, registeredSchemas));
            }
            if (Array.isArray(schema.oneOf)) {
              schema.oneOf = schema.oneOf.map((item: unknown) => replaceNestedSchemas(item, registeredSchemas));
            }
            if (Array.isArray(schema.allOf)) {
              schema.allOf = schema.allOf.map((item: unknown) => replaceNestedSchemas(item, registeredSchemas));
            }
            
            // После рекурсивной обработки проверяем, соответствует ли текущая схема зарегистрированной схеме
            // Работает как для объектов, так и для простых типов
            if (!schema.$ref && (schema.type === 'object' || schema.type === 'string' || schema.type === 'number' || schema.type === 'integer' || schema.type === 'boolean')) {
              for (const [name, registeredSchema] of Object.entries(registeredSchemas)) {
                // Пропускаем саму схему, чтобы не создавать циклические ссылки
                if (name === (schema.title as string)) {
                  continue;
                }
                if (compareJsonSchemas(schema, registeredSchema)) {
                  return {
                    $ref: `#/components/schemas/${name}`
                  };
                }
              }
            }
            
            return schema;
          };
          
          // Применяем рекурсивную обработку ко всем компонентам
          // Важно: обрабатываем компоненты в правильном порядке, чтобы избежать циклических ссылок
          const processedComponents: Record<string, unknown> = {};
          const componentsRecord = components as Record<string, unknown>;
          const componentNames = Object.keys(componentsRecord);
          
          const simpleTypes = ['DateSchema', 'DateTimeSchema'];
          const enumTypes = ['FileFormatEnumSchema', 'ReportTypeEnumSchema', 'ReportTaskStatusEnumSchema', 'CurrencyEnumSchema', 'SortOrderEnumSchema'];
          const objectTypes = componentNames.filter(name => !simpleTypes.includes(name) && !enumTypes.includes(name));
          
          for (const name of [...simpleTypes, ...enumTypes]) {
            if (componentsRecord[name]) {
              processedComponents[name] = componentsRecord[name];
            }
          }
          
          for (const name of objectTypes) {
            if (componentsRecord[name]) {
              processedComponents[name] = replaceNestedSchemas(componentsRecord[name], processedComponents);
            }
          }
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return processedComponents as any;
        })(),
      },
    },
    transform: ({ schema, url }) => {
      if (!schema) {
        return { schema, url };
      }

      const transformed: Record<string, unknown> = {};

      // Проверяем, является ли объект Zod схемой (имеет метод toJSONSchema)
      const isZodSchema = (obj: unknown): boolean => {
        return obj !== null && typeof obj === 'object' && 'toJSONSchema' in obj && typeof (obj as { toJSONSchema?: unknown }).toJSONSchema === 'function';
      };

      // Получаем все зарегистрированные схемы в виде JSON Schema для сравнения
      const registeredSchemas = getOpenApiComponents();
      
      // Функция для нормализации JSON Schema для сравнения (удаляет несущественные поля)
      const normalizeSchema = (schema: unknown): unknown => {
        if (!schema || typeof schema !== 'object') {
          return schema;
        }
        
        const s = schema as Record<string, unknown>;
        const normalized: Record<string, unknown> = {};
        
        // Копируем только существенные поля для сравнения
        if (s.type) normalized.type = s.type;
        if (s.properties) {
          normalized.properties = s.properties;
        }
        if (s.required) {
          normalized.required = Array.isArray(s.required) 
            ? (s.required as unknown[]).slice().sort() 
            : s.required;
        }
        if (s.additionalProperties !== undefined) {
          normalized.additionalProperties = s.additionalProperties;
        }
        
        return normalized;
      };
      
      // Функция для нормализации JSON Schema для сравнения (извлекает только ключевые поля)
      const normalizeForComparison = (schema: unknown): string | null => {
        if (!schema || typeof schema !== 'object') {
          return null;
        }
        
        const s = schema as Record<string, unknown>;
        
        // Для объектов
        if (s.type === 'object') {
          const props = s.properties as Record<string, unknown> | undefined;
          if (!props) {
            return null;
          }
          
          const propertyTypes: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(props)) {
            if (value && typeof value === 'object') {
              const prop = value as Record<string, unknown>;
              propertyTypes[key] = {
                type: prop.type,
                format: prop.format,
                enum: prop.enum ? (Array.isArray(prop.enum) ? prop.enum.slice().sort() : prop.enum) : undefined,
              };
            }
          }
          
          const normalized: Record<string, unknown> = {
            type: 'object',
            propertyKeys: Object.keys(props).sort(),
            propertyTypes,
            required: Array.isArray(s.required) ? (s.required as string[]).slice().sort() : [],
            additionalProperties: s.additionalProperties,
          };
          return JSON.stringify(normalized);
        }
        
        // Для простых типов (string, number и т.д.)
        if (s.type === 'string' || s.type === 'number' || s.type === 'integer' || s.type === 'boolean') {
          const normalized: Record<string, unknown> = {
            type: s.type,
            format: s.format,
            pattern: s.pattern,
            enum: s.enum ? (Array.isArray(s.enum) ? (s.enum as unknown[]).slice().sort() : s.enum) : undefined,
            minimum: s.minimum,
            maximum: s.maximum,
          };
          
          return JSON.stringify(normalized);
        }
        
        return null;
      };
      
      // Функция для сравнения JSON Schema объектов по структуре
      const compareJsonSchemas = (schema1: unknown, schema2: unknown): boolean => {
        const normalized1 = normalizeForComparison(schema1);
        const normalized2 = normalizeForComparison(schema2);
        
        if (!normalized1 || !normalized2) {
          return false;
        }
        
        return normalized1 === normalized2;
      };
      
      // Функция для рекурсивной замены вложенных объектов на $ref ссылки
      const replaceNestedSchemas = (jsonSchema: unknown): unknown => {
        if (!jsonSchema || typeof jsonSchema !== 'object') {
          return jsonSchema;
        }
        
        const schema = jsonSchema as Record<string, unknown>;
        
        // Если это уже ссылка, пропускаем
        if (schema.$ref) {
          return schema;
        }
        
        // Сначала рекурсивно обрабатываем вложенные объекты
        // Рекурсивно обрабатываем properties
        if (schema.properties && typeof schema.properties === 'object') {
          const newProperties: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(schema.properties as Record<string, unknown>)) {
            newProperties[key] = replaceNestedSchemas(value);
          }
          schema.properties = newProperties;
        }
        
        // Рекурсивно обрабатываем items (для массивов)
        if (schema.items) {
          schema.items = replaceNestedSchemas(schema.items);
        }
        
        // Рекурсивно обрабатываем anyOf, oneOf, allOf
        if (Array.isArray(schema.anyOf)) {
          schema.anyOf = schema.anyOf.map((item: unknown) => replaceNestedSchemas(item));
        }
        if (Array.isArray(schema.oneOf)) {
          schema.oneOf = schema.oneOf.map((item: unknown) => replaceNestedSchemas(item));
        }
        if (Array.isArray(schema.allOf)) {
          schema.allOf = schema.allOf.map((item: unknown) => replaceNestedSchemas(item));
        }
        
        // После рекурсивной обработки проверяем, соответствует ли текущий объект зарегистрированной схеме
        // Это должно быть после рекурсивной обработки, чтобы не заменять объекты, которые уже были заменены
        if (schema.type === 'object' && schema.properties && !schema.$ref) {
          for (const [name, registeredSchema] of Object.entries(registeredSchemas)) {
            if (compareJsonSchemas(schema, registeredSchema)) {
              return {
                $ref: `#/components/schemas/${name}`
              };
            }
          }
        }
        
        return schema;
      };
      
      // Функция для конвертации схемы с созданием $ref для зарегистрированных схем
      const convertSchema = (zodSchema: unknown): unknown => {
        // Проверяем, зарегистрирована ли схема
        const schemaName = getSchemaName(zodSchema);
        if (schemaName) {
          // Возвращаем ссылку на компонент
          return {
            $ref: `#/components/schemas/${schemaName}`
          };
        }

        // Если не зарегистрирована, конвертируем как обычно
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonSchema = (zodSchema as any).toJSONSchema({
            target: 'openApi3' as const,
            $refStrategy: 'none' as const,
            removeIncompatibleMeta: true,
          });
          
          // Рекурсивно заменяем вложенные объекты на $ref ссылки
          return replaceNestedSchemas(jsonSchema);
        } catch (error) {
          console.error('Error converting schema:', error);
          return {};
        }
      };

      // Преобразуем body, если это Zod схема
      if (isZodSchema(schema.body)) {
        transformed.body = convertSchema(schema.body);
      } else if (schema.body) {
        transformed.body = schema.body;
      }

      // Преобразуем querystring, если это Zod схема
      if (isZodSchema(schema.querystring)) {
        transformed.querystring = convertSchema(schema.querystring);
      } else if (schema.querystring) {
        transformed.querystring = schema.querystring;
      }

      // Преобразуем params, если это Zod схема
      if (isZodSchema(schema.params)) {
        transformed.params = convertSchema(schema.params);
      } else if (schema.params) {
        transformed.params = schema.params;
      }

      // Преобразуем headers, если это Zod схема
      if (isZodSchema(schema.headers)) {
        transformed.headers = convertSchema(schema.headers);
      } else if (schema.headers) {
        transformed.headers = schema.headers;
      }

      // Преобразуем response
      if (schema.response) {
        transformed.response = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const [statusCode, responseSchema] of Object.entries(schema.response as Record<string, any>)) {
          if (isZodSchema(responseSchema)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (transformed.response as any)[statusCode] = convertSchema(responseSchema);
          } else {
            // Оставляем как есть
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (transformed.response as any)[statusCode] = responseSchema;
          }
        }
      }
      
      // Добавляем описания для статусов, если их нет
      if (transformed.response) {
        const statusDescriptions: Record<string, string> = {
          '200': 'OK',
          '201': 'Created',
          '204': 'No Content',
          '400': 'Bad Request',
          '401': 'Unauthorized',
          '403': 'Forbidden',
          '404': 'Not Found',
          '409': 'Conflict',
          '500': 'Internal Server Error',
          '503': 'Service Unavailable',
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const statusCode of Object.keys(transformed.response as Record<string, any>)) {
          if (statusDescriptions[statusCode]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (transformed.response as any)[statusCode] = {
              description: statusDescriptions[statusCode],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: (transformed.response as any)[statusCode].content || {
                'application/json': {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  schema: (transformed.response as any)[statusCode]
                }
              }
            };
          }
        }
      }

      // Копируем остальные поля схемы
      if (schema.tags) transformed.tags = schema.tags;
      if (schema.summary) transformed.summary = schema.summary;
      if (schema.description) transformed.description = schema.description;
      if (schema.deprecated) transformed.deprecated = schema.deprecated;
      if (schema.security) transformed.security = schema.security;
      if (schema.hide) transformed.hide = schema.hide;

      return { schema: transformed, url };
    },
  });

  // Swagger UI (тёмная тема по умолчанию + переключатель)
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
          filename: 'theme-toggle.js',
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

  // Логирование всех запросов в dev режиме
  if (env.NODE_ENV === 'development') {
    app.addHook('onRequest', async (request, reply) => {
      request.log.info({ url: request.url, method: request.method }, 'incoming request');
    });

    app.addHook('onResponse', async (request, reply) => {
      request.log.info(
        {
          url: request.url,
          method: request.method,
          statusCode: reply.statusCode,
        },
        'request completed'
      );
    });
  }

  // Регистрация маршрутов
  await app.register(routes);

  // Хук для сохранения swagger.json после старта
  app.addHook('onReady', async () => {
    const swaggerJson = app.swagger();
    
    // Получаем зарегистрированные схемы для сравнения
    const registeredSchemas = getOpenApiComponents();
    
    // Функция для нормализации JSON Schema для сравнения
    const normalizeForComparison = (schema: unknown): string | null => {
      if (!schema || typeof schema !== 'object') {
        return null;
      }
      
      const s = schema as Record<string, unknown>;
      
      // Для объектов
      if (s.type === 'object') {
        const props = s.properties as Record<string, unknown> | undefined;
        if (!props) {
          return null;
        }
        
        const propertyTypes: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(props)) {
          if (value && typeof value === 'object') {
            const prop = value as Record<string, unknown>;
            propertyTypes[key] = {
              type: prop.type,
              format: prop.format,
              enum: prop.enum ? (Array.isArray(prop.enum) ? prop.enum.slice().sort() : prop.enum) : undefined,
            };
          }
        }
        const normalized: Record<string, unknown> = {
          type: 'object',
          propertyKeys: Object.keys(props).sort(),
          propertyTypes,
          required: Array.isArray(s.required) ? (s.required as string[]).slice().sort() : [],
          additionalProperties: s.additionalProperties,
        };
        return JSON.stringify(normalized);
      }
      
      // Для простых типов (string, number и т.д.)
      if (s.type === 'string' || s.type === 'number' || s.type === 'integer' || s.type === 'boolean') {
        const normalized: Record<string, unknown> = {
          type: s.type,
          format: s.format,
          pattern: s.pattern,
          enum: s.enum ? (Array.isArray(s.enum) ? (s.enum as unknown[]).slice().sort() : s.enum) : undefined,
          minimum: s.minimum,
          maximum: s.maximum,
        };
        
        return JSON.stringify(normalized);
      }
      
      return null;
    };
    
    // Функция для сравнения JSON Schema
    const compareJsonSchemas = (schema1: unknown, schema2: unknown): boolean => {
      const normalized1 = normalizeForComparison(schema1);
      const normalized2 = normalizeForComparison(schema2);
      
      if (!normalized1 || !normalized2) {
        return false;
      }
      
      return normalized1 === normalized2;
    };
    
    // Функция для замены схем в параметрах на $ref ссылки
    const replaceSchemaInParameters = (parameters: unknown[]): unknown[] => {
      return parameters.map((param: unknown) => {
        if (!param || typeof param !== 'object') {
          return param;
        }
        
        const p = param as Record<string, unknown>;
        
        // Обрабатываем schema внутри параметра
        if (p.schema && typeof p.schema === 'object') {
          const paramSchema = p.schema as Record<string, unknown>;
          
          // Проверяем, соответствует ли схема параметра зарегистрированной схеме
          for (const [name, registeredSchema] of Object.entries(registeredSchemas)) {
            if (compareJsonSchemas(paramSchema, registeredSchema)) {
              p.schema = {
                $ref: `#/components/schemas/${name}`
              };
              break;
            }
          }
        }
        
        return p;
      });
    };
    
    // Обрабатываем все пути и их методы
    if (swaggerJson.paths && typeof swaggerJson.paths === 'object') {
      const paths = swaggerJson.paths as Record<string, unknown>;
      
      for (const [path, pathItem] of Object.entries(paths)) {
        if (!pathItem || typeof pathItem !== 'object') {
          continue;
        }
        
        const item = pathItem as Record<string, unknown>;
        
        // Обрабатываем все HTTP методы
        for (const [method, operation] of Object.entries(item)) {
          if (!operation || typeof operation !== 'object') {
            continue;
          }
          
          const op = operation as Record<string, unknown>;
          
          // Обрабатываем parameters
          if (Array.isArray(op.parameters)) {
            op.parameters = replaceSchemaInParameters(op.parameters);
          }
        }
      }
    }
    
    const swaggerPath = join(process.cwd(), 'docs', 'swagger', 'swagger.json');
    writeFileSync(swaggerPath, JSON.stringify(swaggerJson, null, 2));
    app.log.info(`Swagger JSON saved to ${swaggerPath}`);
  });

  return app;
}
