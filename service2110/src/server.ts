import 'dotenv/config';
import { buildApp } from './app.ts';
import { env } from './config/env.ts';
import { client } from './db/index.ts';

async function start() {
  let app;

  try {
    app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Server is running at http://${env.HOST}:${env.PORT}`);
    app.log.info(`Swagger documentation available at http://${env.HOST}:${env.PORT}/docs`);
    app.log.info(`Health check available at http://${env.HOST}:${env.PORT}/health`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'] as const;

  signals.forEach((signal) => {
    process.on(signal, async () => {
      if (app) {
        app.log.info(`Received ${signal}, closing server gracefully...`);

        try {
          // Закрываем Fastify сервер
          await app.close();
          app.log.info('Fastify server closed');

          // Закрываем подключение к БД
          await client.end();
          app.log.info('Database connection closed');

          process.exit(0);
        } catch (err) {
          app.log.error({ error: err }, 'Error during graceful shutdown');
          process.exit(1);
        }
      }
    });
  });
}

start();
