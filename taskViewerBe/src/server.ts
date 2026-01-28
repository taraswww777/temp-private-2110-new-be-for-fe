import 'dotenv/config';
import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Task Viewer Backend is running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start();
