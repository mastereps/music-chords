import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env';
import { logger } from './config/logger';
import { attachAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes/index';

export function createApp() {
  const app = express();

  app.disable('etag');

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(
    morgan('tiny', {
      stream: {
        write: (message) => logger.info('HTTP request', { line: message.trim() })
      }
    })
  );
  app.use(attachAuth);
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', apiRouter);
  app.use(errorHandler);

  return app;
}
