import type { FastifyPluginAsync, FastifyError } from 'fastify';
import { ZodError } from 'zod';

// RFC 7807 Problem Details interface
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
}

export const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error: FastifyError | Error, request, reply) => {
    const instance = request.url;

    // Обработка Zod ошибок валидации
    if (error instanceof ZodError) {
      const problemDetails: ProblemDetails = {
        type: 'https://httpstatuses.com/422',
        title: 'Validation Error',
        status: 422,
        detail: 'Request validation failed',
        instance,
        errors: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      };

      return reply.status(422).send(problemDetails);
    }

    // Обработка Fastify ошибок
    if ('statusCode' in error) {
      const statusCode = error.statusCode || 500;
      const problemDetails: ProblemDetails = {
        type: `https://httpstatuses.com/${statusCode}`,
        title: error.name || 'Error',
        status: statusCode,
        detail: error.message,
        instance,
      };

      // Добавляем validation errors если есть
      if ('validation' in error && error.validation) {
        problemDetails.errors = error.validation;
      }

      return reply.status(statusCode).send(problemDetails);
    }

    // Обработка стандартных ошибок
    fastify.log.error(error);
    const problemDetails: ProblemDetails = {
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      instance,
    };

    return reply.status(500).send(problemDetails);
  });
};
