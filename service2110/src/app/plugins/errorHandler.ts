// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandlerRFC = (error: Error, request: any, reply: any) => {
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
}
