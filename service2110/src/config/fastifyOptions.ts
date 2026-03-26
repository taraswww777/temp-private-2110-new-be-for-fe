import { env } from './env.ts';
import { FastifyBaseLogger, FastifyServerOptions, RawServerDefault } from 'fastify';

export const fastifyOptions: FastifyServerOptions<RawServerDefault, FastifyBaseLogger> = {
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'error',
  },
  requestIdLogLabel: 'reqId',
  disableRequestLogging: true,
  requestIdHeader: 'x-request-id',
};
