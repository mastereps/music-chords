import { createApp } from './app.js';
import { pool } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

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
