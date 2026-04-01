import type { AuthUser, LineupDetail, LineupInput, LineupSong, LineupSummary } from '@music-chords/shared';
import type { PoolClient } from 'pg';

import { pool, query } from '../../config/db';
import { AppError, assertFound } from '../../utils/http';

interface LineupSummaryRow {
  id: number;
  title: string;
  description: string | null;
  song_count: number;
  created_at: string;
  updated_at: string;
}

interface LineupSongRow {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  song_key: string;
}

function mapLineupSong(row: LineupSongRow): LineupSong {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artist: row.artist,
    key: row.song_key
  };
}

function mapLineupSummary(row: LineupSummaryRow): LineupSummary {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    songCount: row.song_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeDescription(value: string | null | undefined) {
  const normalized = value?.trim() ?? '';
  return normalized.length > 0 ? normalized : null;
}

async function getPublishedSongsInOrder(songIds: number[], client?: PoolClient) {
  const sql = `
    SELECT s.id, s.slug, s.title, s.artist, s.song_key
    FROM songs s
    WHERE s.id = ANY($1::int[])
      AND s.status = 'published'
    ORDER BY array_position($1::int[], s.id)
  `;

  const result = client ? await client.query<LineupSongRow>(sql, [songIds]) : await query<LineupSongRow>(sql, [songIds]);

  if (result.rows.length !== songIds.length) {
    throw new AppError('All lineup songs must exist and be published.', 400);
  }

  return result.rows;
}

async function syncLineupSongs(client: PoolClient, lineupId: number, songIds: number[]) {
  await client.query('DELETE FROM lineup_songs WHERE lineup_id = $1', [lineupId]);

  for (const [index, songId] of songIds.entries()) {
    await client.query(
      `INSERT INTO lineup_songs (lineup_id, song_id, position)
       VALUES ($1, $2, $3)`,
      [lineupId, songId, index + 1]
    );
  }
}

export async function listLineups() {
  const result = await query<LineupSummaryRow>(
    `SELECT
       l.id,
       l.title,
       l.description,
       COUNT(ls.song_id)::int AS song_count,
       l.created_at::text,
       l.updated_at::text
     FROM lineups l
     LEFT JOIN lineup_songs ls ON ls.lineup_id = l.id
     GROUP BY l.id
     ORDER BY l.updated_at DESC, l.id DESC`
  );

  return result.rows.map(mapLineupSummary);
}

export async function getLineupById(id: number): Promise<LineupDetail | null> {
  const summaryResult = await query<LineupSummaryRow>(
    `SELECT
       l.id,
       l.title,
       l.description,
       COUNT(ls.song_id)::int AS song_count,
       l.created_at::text,
       l.updated_at::text
     FROM lineups l
     LEFT JOIN lineup_songs ls ON ls.lineup_id = l.id
     WHERE l.id = $1
     GROUP BY l.id`,
    [id]
  );

  const summary = summaryResult.rows[0];

  if (!summary) {
    return null;
  }

  const songsResult = await query<LineupSongRow>(
    `SELECT s.id, s.slug, s.title, s.artist, s.song_key
     FROM lineup_songs ls
     INNER JOIN songs s ON s.id = ls.song_id
     WHERE ls.lineup_id = $1
       AND s.status = 'published'
     ORDER BY ls.position ASC, ls.song_id ASC`,
    [id]
  );

  return {
    ...mapLineupSummary(summary),
    songs: songsResult.rows.map(mapLineupSong)
  };
}

export async function createLineup(input: LineupInput, actor: AuthUser) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await getPublishedSongsInOrder(input.songIds, client);

    const insertResult = await client.query<{ id: number }>(
      `INSERT INTO lineups (title, description, created_by, updated_by)
       VALUES ($1, $2, $3, $3)
       RETURNING id`,
      [input.title.trim(), normalizeDescription(input.description), actor.id]
    );

    const lineupId = insertResult.rows[0].id;
    await syncLineupSongs(client, lineupId, input.songIds);
    await client.query('COMMIT');

    return assertFound(await getLineupById(lineupId), 'Lineup not found after create');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateLineup(id: number, input: LineupInput, actor: AuthUser) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const existingResult = await client.query<{ id: number }>('SELECT id FROM lineups WHERE id = $1 FOR UPDATE', [id]);
    assertFound(existingResult.rows[0], 'Lineup not found');

    await getPublishedSongsInOrder(input.songIds, client);

    await client.query(
      `UPDATE lineups
       SET title = $2,
           description = $3,
           updated_by = $4,
           updated_at = NOW()
       WHERE id = $1`,
      [id, input.title.trim(), normalizeDescription(input.description), actor.id]
    );

    await syncLineupSongs(client, id, input.songIds);
    await client.query('COMMIT');

    return assertFound(await getLineupById(id), 'Lineup not found after update');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteLineup(id: number) {
  const result = await query<{ id: number }>('DELETE FROM lineups WHERE id = $1 RETURNING id', [id]);
  assertFound(result.rows[0], 'Lineup not found');
}
