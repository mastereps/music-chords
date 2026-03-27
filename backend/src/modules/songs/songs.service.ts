import type {
  AuthUser,
  Category,
  PaginatedResponse,
  SongDetail,
  SongInput,
  SongRevision,
  SongStatus,
  SongSummary,
  SuggestionInput,
  Tag
} from '@music-chords/shared';
import type { PoolClient } from 'pg';

import { pool, query } from '../../config/db.js';
import { AppError, assertFound } from '../../utils/http.js';

interface SongSearchFilters {
  q?: string;
  page: number;
  pageSize: number;
  categoryId?: number;
  artist?: string;
  tag?: string;
  language?: string;
  status?: SongStatus;
}

interface SongListRow {
  id: number;
  title: string;
  artist: string | null;
  song_key: string;
  slug: string;
  language: string | null;
  status: SongStatus;
  updated_at: string;
  category: Category | null;
  tags: Tag[];
}

interface SongDetailRow extends SongListRow {
  content: string;
  created_at: string;
  created_by: Pick<AuthUser, 'id' | 'displayName' | 'email'> | null;
  updated_by: Pick<AuthUser, 'id' | 'displayName' | 'email'> | null;
}

interface RevisionRow {
  id: number;
  song_id: number;
  revision_note: string | null;
  previous_content: string;
  new_content: string;
  created_at: string;
  editor: Pick<AuthUser, 'id' | 'displayName' | 'email'>;
}

const SONG_SEARCH_VECTOR = `
  setweight(to_tsvector('simple', COALESCE(s.title, '')), 'A') ||
  setweight(to_tsvector('simple', COALESCE(s.artist, '')), 'B') ||
  setweight(to_tsvector('simple', COALESCE(s.content, '')), 'C')
`;

function mapSongSummary(row: SongListRow): SongSummary {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    key: row.song_key,
    slug: row.slug,
    category: row.category,
    tags: row.tags ?? [],
    language: row.language,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapSongDetail(row: SongDetailRow): SongDetail {
  return {
    ...mapSongSummary(row),
    content: row.content,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by
  };
}

function mapRevision(row: RevisionRow): SongRevision {
  return {
    id: row.id,
    songId: row.song_id,
    revisionNote: row.revision_note,
    previousContent: row.previous_content,
    newContent: row.new_content,
    editor: row.editor,
    createdAt: row.created_at
  };
}

function buildSongQueryParts(filters: SongSearchFilters, canViewDrafts: boolean) {
  const clauses: string[] = [];
  const values: unknown[] = [];
  let rankExpression = '0::real';

  if (!canViewDrafts) {
    clauses.push(`s.status = 'published'`);
  } else if (filters.status) {
    values.push(filters.status);
    clauses.push(`s.status = $${values.length}`);
  }

  if (filters.categoryId) {
    values.push(filters.categoryId);
    clauses.push(`s.category_id = $${values.length}`);
  }

  if (filters.artist) {
    values.push(filters.artist);
    clauses.push(`LOWER(COALESCE(s.artist, '')) = LOWER($${values.length})`);
  }

  if (filters.language) {
    values.push(filters.language);
    clauses.push(`LOWER(COALESCE(s.language, '')) = LOWER($${values.length})`);
  }

  if (filters.tag) {
    values.push(`%${filters.tag}%`);
    clauses.push(`EXISTS (
      SELECT 1
      FROM song_tags st2
      INNER JOIN tags t2 ON t2.id = st2.tag_id
      WHERE st2.song_id = s.id AND (t2.name ILIKE $${values.length} OR t2.slug ILIKE $${values.length})
    )`);
  }

  if (filters.q) {
    values.push(filters.q);
    const queryParam = `$${values.length}`;
    values.push(`%${filters.q}%`);
    const likeParam = `$${values.length}`;

    rankExpression = `(
      ts_rank_cd(${SONG_SEARCH_VECTOR}, websearch_to_tsquery('simple', ${queryParam})) +
      CASE WHEN s.slug ILIKE ${likeParam} THEN 4 ELSE 0 END +
      CASE WHEN s.title ILIKE ${likeParam} THEN 2 ELSE 0 END +
      CASE WHEN COALESCE(s.artist, '') ILIKE ${likeParam} THEN 1 ELSE 0 END
    )`;

    clauses.push(`(
      ${SONG_SEARCH_VECTOR} @@ websearch_to_tsquery('simple', ${queryParam})
      OR s.slug ILIKE ${likeParam}
      OR s.title ILIKE ${likeParam}
      OR COALESCE(s.artist, '') ILIKE ${likeParam}
      OR EXISTS (
        SELECT 1
        FROM song_tags st3
        INNER JOIN tags t3 ON t3.id = st3.tag_id
        WHERE st3.song_id = s.id AND (t3.name ILIKE ${likeParam} OR t3.slug ILIKE ${likeParam})
      )
      OR EXISTS (
        SELECT 1
        FROM categories c3
        WHERE c3.id = s.category_id AND (c3.name ILIKE ${likeParam} OR c3.slug ILIKE ${likeParam})
      )
    )`);
  }

  return {
    clause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
    rankExpression
  };
}

function listQuery(whereClause: string, rankExpression: string, limitPlaceholder: number, offsetPlaceholder: number) {
  return `
    WITH filtered_songs AS (
      SELECT
        s.id,
        ${rankExpression} AS search_rank,
        s.title
      FROM songs s
      ${whereClause}
      ORDER BY LOWER(s.title) ASC, s.title ASC, search_rank DESC, s.id ASC
      LIMIT $${limitPlaceholder}
      OFFSET $${offsetPlaceholder}
    )
    SELECT
      s.id,
      s.title,
      s.artist,
      s.song_key,
      s.slug,
      s.language,
      s.status,
      s.updated_at::text,
      CASE
        WHEN c.id IS NULL THEN NULL
        ELSE json_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug,
          'parentId', c.parent_id,
          'sortOrder', c.sort_order,
          'songCount', NULL,
          'childCount', NULL
        )
      END AS category,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
        FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
      ) AS tags
    FROM filtered_songs fs
    INNER JOIN songs s ON s.id = fs.id
    LEFT JOIN categories c ON c.id = s.category_id
    LEFT JOIN song_tags st ON st.song_id = s.id
    LEFT JOIN tags t ON t.id = st.tag_id
    GROUP BY s.id, c.id, fs.search_rank
    ORDER BY LOWER(s.title) ASC, s.title ASC, fs.search_rank DESC, s.id ASC;
  `;
}

async function syncSongTags(client: PoolClient, songId: number, tagIds: number[]) {
  const uniqueTagIds = [...new Set(tagIds)];

  await client.query('DELETE FROM song_tags WHERE song_id = $1', [songId]);

  for (const tagId of uniqueTagIds) {
    await client.query(
      `INSERT INTO song_tags (song_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT (song_id, tag_id) DO NOTHING`,
      [songId, tagId]
    );
  }
}

async function fetchSongDetailByCondition(whereClause: string, values: unknown[]) {
  const result = await query<SongDetailRow>(
    `SELECT
       s.id,
       s.title,
       s.artist,
       s.song_key,
       s.slug,
       s.content,
       s.language,
       s.status,
       s.created_at::text,
       s.updated_at::text,
       CASE
         WHEN c.id IS NULL THEN NULL
         ELSE json_build_object(
           'id', c.id,
           'name', c.name,
           'slug', c.slug,
           'parentId', c.parent_id,
           'sortOrder', c.sort_order,
           'songCount', NULL,
           'childCount', NULL
         )
       END AS category,
       COALESCE(
         json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
         FILTER (WHERE t.id IS NOT NULL),
         '[]'::json
       ) AS tags,
       CASE
         WHEN creator.id IS NULL THEN NULL
         ELSE json_build_object('id', creator.id, 'displayName', creator.display_name, 'email', creator.email)
       END AS created_by,
       CASE
         WHEN updater.id IS NULL THEN NULL
         ELSE json_build_object('id', updater.id, 'displayName', updater.display_name, 'email', updater.email)
       END AS updated_by
     FROM songs s
     LEFT JOIN categories c ON c.id = s.category_id
     LEFT JOIN song_tags st ON st.song_id = s.id
     LEFT JOIN tags t ON t.id = st.tag_id
     LEFT JOIN users creator ON creator.id = s.created_by
     LEFT JOIN users updater ON updater.id = s.updated_by
     ${whereClause}
     GROUP BY s.id, c.id, creator.id, updater.id
     LIMIT 1`,
    values
  );

  return result.rows[0] ? mapSongDetail(result.rows[0]) : null;
}

export async function listSongs(filters: SongSearchFilters, canViewDrafts: boolean): Promise<PaginatedResponse<SongSummary>> {
  const { clause, values, rankExpression } = buildSongQueryParts(filters, canViewDrafts);
  const paginationValues = [...values, filters.pageSize, (filters.page - 1) * filters.pageSize];

  const [itemsResult, totalResult] = await Promise.all([
    query<SongListRow>(listQuery(clause, rankExpression, paginationValues.length - 1, paginationValues.length), paginationValues),
    query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM songs s ${clause}`, values)
  ]);

  return {
    items: itemsResult.rows.map(mapSongSummary),
    page: filters.page,
    pageSize: filters.pageSize,
    total: Number(totalResult.rows[0]?.total ?? 0)
  };
}

export async function getSongBySlug(slug: string, canViewDrafts: boolean) {
  const values: unknown[] = [slug];
  let whereClause = 'WHERE s.slug = $1';

  if (!canViewDrafts) {
    whereClause += ` AND s.status = 'published'`;
  }

  return fetchSongDetailByCondition(whereClause, values);
}

export async function getSongById(id: number) {
  return fetchSongDetailByCondition('WHERE s.id = $1', [id]);
}

export async function createSong(input: SongInput, actor: AuthUser) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const insertResult = await client.query<{ id: number }>(
      `INSERT INTO songs (
         title,
         artist,
         song_key,
         slug,
         content,
         category_id,
         language,
         status,
         created_by,
         updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
       RETURNING id`,
      [
        input.title,
        input.artist ?? null,
        input.key,
        input.slug,
        input.content,
        input.categoryId ?? null,
        input.language ?? null,
        input.status,
        actor.id
      ]
    );

    const songId = insertResult.rows[0].id;
    await syncSongTags(client, songId, input.tagIds);
    await client.query('COMMIT');

    return assertFound(await getSongById(songId), 'Song not found after create');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateSong(id: number, input: SongInput, actor: AuthUser) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const existingResult = await client.query<{ content: string }>('SELECT content FROM songs WHERE id = $1 FOR UPDATE', [id]);
    const existing = assertFound(existingResult.rows[0], 'Song not found');

    await client.query(
      `UPDATE songs
       SET title = $2,
           artist = $3,
           song_key = $4,
           slug = $5,
           content = $6,
           category_id = $7,
           language = $8,
           status = $9,
           updated_by = $10,
           updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        input.title,
        input.artist ?? null,
        input.key,
        input.slug,
        input.content,
        input.categoryId ?? null,
        input.language ?? null,
        input.status,
        actor.id
      ]
    );

    await syncSongTags(client, id, input.tagIds);

    if (existing.content !== input.content || input.revisionNote?.trim()) {
      await client.query(
        `INSERT INTO song_revisions (song_id, editor_id, revision_note, previous_content, new_content)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, actor.id, input.revisionNote ?? null, existing.content, input.content]
      );
    }

    await client.query('COMMIT');

    return assertFound(await getSongById(id), 'Song not found after update');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteSong(id: number) {
  const result = await query<{ id: number }>('DELETE FROM songs WHERE id = $1 RETURNING id', [id]);
  assertFound(result.rows[0], 'Song not found');
}

export async function getSongRevisions(songId: number) {
  const result = await query<RevisionRow>(
    `SELECT
       sr.id,
       sr.song_id,
       sr.revision_note,
       sr.previous_content,
       sr.new_content,
       sr.created_at::text,
       json_build_object('id', u.id, 'displayName', u.display_name, 'email', u.email) AS editor
     FROM song_revisions sr
     INNER JOIN users u ON u.id = sr.editor_id
     WHERE sr.song_id = $1
     ORDER BY sr.created_at DESC`,
    [songId]
  );

  return result.rows.map(mapRevision);
}

export async function createSuggestion(songId: number, input: SuggestionInput, actor?: AuthUser) {
  const song = await getSongById(songId);

  if (!song) {
    throw new AppError('Song not found', 404);
  }

  await query(
    `INSERT INTO correction_suggestions (
       song_id,
       suggested_by,
       contact_name,
       message,
       proposed_content,
       status
     ) VALUES ($1, $2, $3, $4, $5, 'pending')`,
    [songId, actor?.id ?? null, input.contactName ?? null, input.message, input.proposedContent]
  );
}

export async function getDashboardStats() {
  const result = await query<{
    total_songs: string;
    published_songs: string;
    draft_songs: string;
    total_categories: string;
    pending_suggestions: string;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM songs)::text AS total_songs,
       (SELECT COUNT(*) FROM songs WHERE status = 'published')::text AS published_songs,
       (SELECT COUNT(*) FROM songs WHERE status = 'draft')::text AS draft_songs,
       (SELECT COUNT(*) FROM categories)::text AS total_categories,
       (SELECT COUNT(*) FROM correction_suggestions WHERE status = 'pending')::text AS pending_suggestions`
  );

  const row = result.rows[0];
  return {
    totalSongs: Number(row.total_songs),
    publishedSongs: Number(row.published_songs),
    draftSongs: Number(row.draft_songs),
    totalCategories: Number(row.total_categories),
    pendingSuggestions: Number(row.pending_suggestions)
  };
}


