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
import { getSchemaName } from './schemas/schema-registry.js';

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
        schemas: getOpenApiComponents(),
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
          return (zodSchema as any).toJSONSchema({
            target: 'openApi3' as const,
            $refStrategy: 'none' as const,
            removeIncompatibleMeta: true,
          });
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

  // Swagger UI
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
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
    const swaggerPath = join(process.cwd(), 'docs', 'swagger', 'swagger.json');
    writeFileSync(swaggerPath, JSON.stringify(swaggerJson, null, 2));
    app.log.info(`Swagger JSON saved to ${swaggerPath}`);
  });

  return app;
}
