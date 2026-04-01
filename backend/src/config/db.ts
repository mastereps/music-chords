import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';

import { env } from './env';
import { logger } from './logger';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on('error', (error: Error) => {
  logger.error('Unexpected PostgreSQL pool error', { error: error.message });
});

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  return pool.query<T>(text, params);
}
