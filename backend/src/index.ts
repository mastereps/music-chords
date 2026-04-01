import { createApp } from './app';
import { pool } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('Backend server started', { port: env.PORT, env: env.NODE_ENV });
});

const shutdown = async () => {
  logger.info('Shutting down backend server');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
