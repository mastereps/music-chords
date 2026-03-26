import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { z } from 'zod';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const envPaths = [
  path.resolve(moduleDir, '../../.env'),
  path.resolve(process.cwd(), '.env')
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@example.com'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('Admin123!')
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';
