import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import pg from 'pg';

const { Client } = pg;
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = path.join(rootDir, 'database', 'migrations');

dotenv.config({ path: path.join(rootDir, 'backend', '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required. Set it in backend/.env or the environment.');
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await client.connect();
  await client.query(`SELECT pg_advisory_lock(hashtext('music-chords-migrations'))`);

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const filenames = (await readdir(migrationsDir))
      .filter((filename) => /^\d{3}_[a-z0-9_]+\.sql$/.test(filename))
      .sort();

    const prefixes = filenames.map((filename) => filename.slice(0, 3));
    const duplicatePrefix = prefixes.find((prefix, index) => prefixes.indexOf(prefix) !== index);

    if (duplicatePrefix) {
      throw new Error(`Duplicate migration prefix detected: ${duplicatePrefix}`);
    }

    const appliedResult = await client.query('SELECT filename FROM schema_migrations');
    const appliedFilenames = new Set(appliedResult.rows.map((row) => row.filename));

    for (const filename of filenames) {
      if (appliedFilenames.has(filename)) {
        console.log(`Skipping ${filename}`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, filename), 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`Applied ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query(`SELECT pg_advisory_unlock(hashtext('music-chords-migrations'))`);
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
