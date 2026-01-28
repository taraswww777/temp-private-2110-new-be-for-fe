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

  // Swagger плагин
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Backend API',
        description: 'API документация для Backend проекта на Fastify + TypeScript + PostgreSQL',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Report 6406 - References', description: 'Справочники для формы отчётности 6406' },
        { name: 'Report 6406 - Tasks', description: 'Задания на построение отчётов для формы 6406' },
        { name: 'Report 6406 - Packages', description: 'Пакеты заданий для формы 6406' },
      ],
    },
    transform: ({ schema, url }) => {
      // Преобразование Zod схем в JSON Schema для Swagger
      return { schema, url };
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
