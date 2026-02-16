import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import {
  isResponseSerializationError,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './config/env.ts';
import { routes } from './routes/index.ts';

/** Формат одной ошибки валидации для ответа API */
interface ValidationDetail {
  path: string;
  message: string;
  expectedValues?: string[];
}

/** Стандартный формат тела ошибки API */
interface ApiErrorBody {
  message: string;
  code: string;
  details?: ValidationDetail[];
}

function formatValidationDetails(cause: { issues: Array<{ path?: unknown[]; message: string; values?: unknown[] }> }): ValidationDetail[] {
  return cause.issues.map((issue) => ({
    path: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path),
    message: issue.message,
    ...(Array.isArray(issue.values) && issue.values.length > 0
      ? { expectedValues: issue.values.map(String) }
      : {}),
  }));
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  }).withTypeProvider<ZodTypeProvider>();

  // Валидация Zod
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // CORS
  await app.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // Регистрация маршрутов
  await app.register(routes);

  // Обработчик ошибок: информативные ответы для валидации и сериализации
  app.setErrorHandler((err: unknown, request, reply) => {
    const error = err as { statusCode?: number; message?: string; code?: string; cause?: { issues?: unknown[] }; validation?: unknown[] };
    const statusCode = error.statusCode ?? 500;

    if (isResponseSerializationError(err) && error.cause?.issues) {
      const details = formatValidationDetails(error.cause as Parameters<typeof formatValidationDetails>[0]);
      const body: ApiErrorBody = {
        message: 'Ответ не соответствует схеме. Проверьте данные в манифесте задач (например, допустимые статусы: backlog, planned, in-progress, completed, cancelled).',
        code: 'VALIDATION_ERROR',
        details,
      };
      return reply.status(422).send(body);
    }

    // Ошибки валидации тела/параметров запроса (если есть validation)
    const validation = error.validation;
    if (Array.isArray(validation) && validation.length > 0) {
      const details: ValidationDetail[] = validation.map((v: unknown) => {
        const item = v as { params?: { instancePath?: string }; message?: string };
        return {
          path: item.params?.instancePath ?? '',
          message: item.message ?? 'Ошибка валидации',
        };
      });
      const body: ApiErrorBody = {
        message: 'Данные запроса не прошли валидацию.',
        code: 'VALIDATION_ERROR',
        details,
      };
      return reply.status(400).send(body);
    }

    // Прочие ошибки — единый формат
    const body: ApiErrorBody = {
      message: error.message ?? 'Внутренняя ошибка сервера',
      code: error.code ?? 'INTERNAL_ERROR',
    };
    return reply.status(statusCode).send(body);
  });

  return app;
}
