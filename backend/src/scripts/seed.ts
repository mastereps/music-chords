import { query, pool } from '../config/db';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { hashPassword } from '../utils/security';

interface SeedSong {
  title: string;
  artist: string | null;
  key: string;
  slug: string;
  content: string;
  categorySlug: string;
  tagSlugs: string[];
  status: 'draft' | 'published';
  language: string;
}

async function seed() {
  const passwordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);

  await query(`INSERT INTO roles (name) VALUES ('admin'), ('editor'), ('viewer') ON CONFLICT (name) DO NOTHING`);

  const adminRole = await query<{ id: number }>(`SELECT id FROM roles WHERE name = 'admin'`);
  const adminRoleId = adminRole.rows[0].id;

  await query(
    `INSERT INTO users (email, password_hash, display_name, role_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         display_name = EXCLUDED.display_name,
         role_id = EXCLUDED.role_id,
         updated_at = NOW()`,
    [env.SEED_ADMIN_EMAIL, passwordHash, 'Project Admin', adminRoleId]
  );

  await query(
    `UPDATE categories
     SET name = 'Praising',
         slug = 'praising',
         sort_order = 1,
         updated_at = NOW()
     WHERE slug = 'praise'
       AND NOT EXISTS (SELECT 1 FROM categories existing WHERE existing.slug = 'praising')`
  );

  await query(
    `UPDATE categories
     SET name = 'Praising',
         sort_order = 1,
         updated_at = NOW()
     WHERE slug = 'praising'`
  );

  await query(
    `INSERT INTO categories (name, slug, sort_order)
     VALUES
       ('Praising', 'praising', 1),
       ('Worship', 'worship', 2),
       ('Old Songs', 'old-songs', 3),
       ('Christmas', 'christmas', 4),
       ('Youth', 'youth', 5),
       ('Special Number', 'special-number', 6)
     ON CONFLICT (slug) DO UPDATE
     SET name = EXCLUDED.name,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`
  );

  await query(
    `INSERT INTO tags (name, slug)
     VALUES
       ('Communion', 'communion'),
       ('Opening', 'opening'),
       ('Prayer', 'prayer'),
       ('Fast', 'fast'),
       ('Reflection', 'reflection')
     ON CONFLICT (slug) DO UPDATE
     SET name = EXCLUDED.name`
  );

  const adminUser = await query<{ id: number }>('SELECT id FROM users WHERE email = $1', [env.SEED_ADMIN_EMAIL]);
  const categoryMap = await query<{ id: number; slug: string }>('SELECT id, slug FROM categories');
  const tagMap = await query<{ id: number; slug: string }>('SELECT id, slug FROM tags');

  const categories = new Map<string, number>(categoryMap.rows.map((row) => [row.slug, row.id]));
  const tags = new Map<string, number>(tagMap.rows.map((row) => [row.slug, row.id]));
  const adminId = adminUser.rows[0].id;

  const songs: SeedSong[] = [
    {
      title: 'Open the Eyes of My Heart',
      artist: 'Paul Baloche',
      key: 'E',
      slug: 'open-the-eyes-of-my-heart',
      content: `Verse 1\nE   A2/E   E\nOpen the eyes of my heart, Lord\nE   Bsus   A2\nOpen the eyes of my heart\n\nChorus\nE      B\nI want to see You\nA2            B\nI want to see You`,
      categorySlug: 'worship',
      tagSlugs: ['opening', 'reflection'],
      status: 'published',
      language: 'English'
    },
    {
      title: 'Shout to the Lord',
      artist: 'Darlene Zschech',
      key: 'G',
      slug: 'shout-to-the-lord',
      content: `Verse 1\nG      D/F#   Em\nMy Jesus, my Savior\nC           G/D  Am7   D\nLord there is none like You\n\nChorus\nG    Em   C   D\nShout to the Lord all the earth let us sing`,
      categorySlug: 'praising',
      tagSlugs: ['fast'],
      status: 'published',
      language: 'English'
    },
    {
      title: 'Youth Revival Song',
      artist: null,
      key: 'D',
      slug: 'youth-revival-song',
      content: `Intro\nD   A   Bm   G\n\nVerse 1\nD       A\nWe will follow You\nBm      G\nWith an open heart`,
      categorySlug: 'youth',
      tagSlugs: ['prayer'],
      status: 'draft',
      language: 'English'
    }
  ];

  for (const song of songs) {
    await query(
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
       ON CONFLICT (slug) DO UPDATE
       SET title = EXCLUDED.title,
           artist = EXCLUDED.artist,
           song_key = EXCLUDED.song_key,
           content = EXCLUDED.content,
           category_id = EXCLUDED.category_id,
           language = EXCLUDED.language,
           status = EXCLUDED.status,
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()`,
      [
        song.title,
        song.artist,
        song.key,
        song.slug,
        song.content,
        categories.get(song.categorySlug) ?? null,
        song.language,
        song.status,
        adminId
      ]
    );

    const songRow = await query<{ id: number }>('SELECT id FROM songs WHERE slug = $1', [song.slug]);
    const songId = songRow.rows[0].id;

    await query('DELETE FROM song_tags WHERE song_id = $1', [songId]);

    for (const tagSlug of song.tagSlugs) {
      const tagId = tags.get(tagSlug);

      if (tagId) {
        await query(
          `INSERT INTO song_tags (song_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT (song_id, tag_id) DO NOTHING`,
          [songId, tagId]
        );
      }
    }
  }

  logger.info('Seed completed', { email: env.SEED_ADMIN_EMAIL });
}

seed()
  .catch((error) => {
    logger.error('Seed failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
