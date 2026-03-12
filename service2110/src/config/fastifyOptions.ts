import { env } from './env.ts';
import { FastifyBaseLogger, FastifyServerOptions, RawServerDefault } from 'fastify';

export const fastifyOptions: FastifyServerOptions<RawServerDefault, FastifyBaseLogger> = {
  logger: {
    level: env.NODE_ENV === 'development' ? 'warn' : 'error',
  },
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  requestIdHeader: 'x-request-id',
};
