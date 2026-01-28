/**
 * Плагин для извлечения информации о пользователе из заголовков запроса
 * 
 * Это упрощённая моковая реализация для разработки.
 * Настоящая авторизация через JWT и проверка прав доступа
 * будут реализованы в отдельной задаче.
 */

import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Роли пользователей
 */
export type UserRole = 'user' | 'manager' | 'admin';

/**
 * Контекст пользователя
 */
export interface UserContext {
  role: UserRole;
  name: string;
  id: string;
}

/**
 * Расширение типа FastifyRequest для добавления контекста пользователя
 */
declare module 'fastify' {
  interface FastifyRequest {
    user: UserContext;
  }
}

/**
 * Плагин для извлечения информации о пользователе из заголовков запроса
 */
const userContextPlugin: FastifyPluginAsync = async (fastify) => {
  // Хук для извлечения информации о пользователе из заголовков
  fastify.addHook('onRequest', async (request, reply) => {
    // Извлекаем данные из заголовков
    const roleHeader = request.headers['x-user-role'] as string | undefined;
    const nameHeader = request.headers['x-user-name'] as string | undefined;
    const idHeader = request.headers['x-user-id'] as string | undefined;

    // Устанавливаем значения по умолчанию
    const role = roleHeader || 'user';
    const name = nameHeader || 'Anonymous User';
    const id = idHeader || 'anonymous';

    // Валидация роли
    if (!['user', 'manager', 'admin'].includes(role)) {
      return reply.status(400).send({
        type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
        title: 'Bad Request',
        status: 400,
        detail: `Invalid role: ${role}. Allowed values: user, manager, admin`,
      });
    }

    // Устанавливаем контекст пользователя напрямую
    // @ts-expect-error - добавляем свойство динамически
    request.user = {
      role: role as UserRole,
      name,
      id,
    };

    // Логируем информацию о пользователе (для отладки)
    fastify.log.debug({
      user: request.user,
      url: request.url,
      method: request.method,
    }, 'User context extracted from headers');
  });
};

export default fp(userContextPlugin, {
  name: 'user-context',
});
