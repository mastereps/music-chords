import type { Category } from '@music-chords/shared';

import { query } from '../../config/db';
import { AppError, assertFound } from '../../utils/http';

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
  song_count: string;
  child_count: string;
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    songCount: Number(row.song_count ?? 0),
    childCount: Number(row.child_count ?? 0)
  };
}

async function ensureParentExists(parentId: number | null) {
  if (!parentId) {
    return;
  }

  const parentResult = await query<{ id: number }>('SELECT id FROM categories WHERE id = $1', [parentId]);
  assertFound(parentResult.rows[0], 'Parent category not found');
}

async function ensureNoCycle(id: number, parentId: number | null) {
  if (!parentId) {
    return;
  }

  if (id === parentId) {
    throw new AppError('A category cannot be its own parent.', 400);
  }

  const cycleResult = await query<{ id: number }>(
    `WITH RECURSIVE descendants AS (
       SELECT id, parent_id
       FROM categories
       WHERE parent_id = $1
       UNION ALL
       SELECT c.id, c.parent_id
       FROM categories c
       INNER JOIN descendants d ON d.id = c.parent_id
     )
     SELECT id
     FROM descendants
     WHERE id = $2`,
    [id, parentId]
  );

  if (cycleResult.rows[0]) {
    throw new AppError('A category cannot be moved inside one of its own children.', 400);
  }
}

export async function listCategories() {
  const result = await query<CategoryRow>(
    `SELECT
       c.id,
       c.name,
       c.slug,
       c.parent_id,
       c.sort_order,
       (SELECT COUNT(*)::text FROM songs s WHERE s.category_id = c.id) AS song_count,
       (SELECT COUNT(*)::text FROM categories child WHERE child.parent_id = c.id) AS child_count
     FROM categories c
     ORDER BY c.sort_order ASC, c.name ASC`
  );

  return result.rows.map(mapCategory);
}

export async function createCategory(input: Omit<Category, 'id'>) {
  await ensureParentExists(input.parentId ?? null);

  const result = await query<CategoryRow>(
    `INSERT INTO categories (name, slug, parent_id, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, slug, parent_id, sort_order,
       '0'::text AS song_count,
       '0'::text AS child_count`,
    [input.name, input.slug, input.parentId, input.sortOrder]
  );

  return mapCategory(result.rows[0]);
}

export async function updateCategory(id: number, input: Omit<Category, 'id'>) {
  await ensureParentExists(input.parentId ?? null);
  await ensureNoCycle(id, input.parentId ?? null);

  const result = await query<CategoryRow>(
    `UPDATE categories
     SET name = $2,
         slug = $3,
         parent_id = $4,
         sort_order = $5,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, slug, parent_id, sort_order,
       (SELECT COUNT(*)::text FROM songs s WHERE s.category_id = categories.id) AS song_count,
       (SELECT COUNT(*)::text FROM categories child WHERE child.parent_id = categories.id) AS child_count`,
    [id, input.name, input.slug, input.parentId, input.sortOrder]
  );

  return mapCategory(assertFound(result.rows[0], 'Category not found'));
}

export async function deleteCategory(id: number) {
  const usageResult = await query<{ song_count: string; child_count: string }>(
    `SELECT
       (SELECT COUNT(*)::text FROM songs WHERE category_id = $1) AS song_count,
       (SELECT COUNT(*)::text FROM categories WHERE parent_id = $1) AS child_count`,
    [id]
  );

  const usage = assertFound(usageResult.rows[0], 'Category not found');

  if (Number(usage.child_count) > 0) {
    throw new AppError('Move or delete child categories before removing this folder.', 409);
  }

  if (Number(usage.song_count) > 0) {
    throw new AppError('Move songs out of this folder before deleting it.', 409);
  }

  const result = await query<{ id: number }>('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  assertFound(result.rows[0], 'Category not found');
}
