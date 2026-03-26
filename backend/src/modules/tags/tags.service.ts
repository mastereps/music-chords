import type { Tag } from '@music-chords/shared';

import { query } from '../../config/db';

interface TagRow {
  id: number;
  name: string;
  slug: string;
}

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug
  };
}

export async function listTags() {
  const result = await query<TagRow>('SELECT id, name, slug FROM tags ORDER BY name ASC');
  return result.rows.map(mapTag);
}

export async function createTag(name: string, slug: string) {
  const result = await query<TagRow>(
    `INSERT INTO tags (name, slug)
     VALUES ($1, $2)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING id, name, slug`,
    [name, slug]
  );

  return mapTag(result.rows[0]);
}
