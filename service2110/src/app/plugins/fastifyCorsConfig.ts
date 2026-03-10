import type { FastifyCorsOptions } from '@fastify/cors';

export const fastifyCorsConfig: FastifyCorsOptions = {
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
}
