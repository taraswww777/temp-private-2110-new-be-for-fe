import 'dotenv/config';
import { buildApp } from './app.js';
import { env } from './config/env.js';
import { youtrackProcessorService } from './services/youtrack-processor.service.js';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Task Viewer Backend is running at http://${env.HOST}:${env.PORT}`);

    // Обрабатываем очередь операций YouTrack при старте (асинхронно, не блокируя запуск)
    processQueueOnStartup(app.log).catch((err) => {
      app.log.warn('Failed to process YouTrack queue on startup:', err);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

async function processQueueOnStartup(logger: { info: (msg: string) => void; warn: (msg: string) => void }) {
  // Небольшая задержка, чтобы дать серверу время запуститься
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (!youtrackProcessorService.isYouTrackAvailable()) {
    logger.info('YouTrack is not configured, skipping queue processing');
    return;
  }

  try {
    logger.info('Processing YouTrack queue...');
    const result = await youtrackProcessorService.processPendingOperations();
    
    if (result.processed > 0 || result.failed > 0) {
      logger.info(
        `YouTrack queue processed: ${result.processed} completed, ${result.failed} failed`
      );
      
      if (result.errors.length > 0) {
        logger.warn(`Errors during queue processing: ${JSON.stringify(result.errors)}`);
      }
    }
  } catch (error) {
    logger.warn(`Error processing YouTrack queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

start();
