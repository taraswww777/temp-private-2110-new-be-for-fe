import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider, } from 'fastify-type-provider-zod';
import { env } from '../config/env.ts';
import { routes } from '../routes';
import { errorHandler } from '../plugins/error-handler.ts';
import userContextPlugin from '../plugins/user-context.ts';
import { fastifyOptions } from '../config/fastifyOptions.ts';
import { fastifyCorsConfig } from './plugins/fastifyCorsConfig.ts';
import { registerFastifySwagger } from './plugins/registerFastifySwagger.ts';
import { errorHandlerRFC } from './plugins/errorHandler.ts';

export async function buildApp() {
  const app = Fastify(fastifyOptions).withTypeProvider<ZodTypeProvider>();

  // Установка валидаторов Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Настройка обработки ошибок валидации в формате RFC 7807
  app.setErrorHandler(errorHandlerRFC);
  // Регистрация обработчика ошибок
  await app.register(errorHandler);

  // CORS плагин - разрешаем все запросы с localhost
  await app.register(fastifyCors, fastifyCorsConfig);

  // Регистрация плагина для контекста пользователя
  await app.register(userContextPlugin);

  await registerFastifySwagger(app)


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

  return app;
}
