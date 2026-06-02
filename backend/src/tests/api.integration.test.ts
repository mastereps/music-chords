import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Express } from 'express';
import type { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeWithDatabase = testDatabaseUrl ? describe : describe.skip;

describeWithDatabase('API integration', () => {
  let app: Express;
  let pool: Pool;
  let hashPassword: (value: string) => Promise<string>;
  let adminAgent: ReturnType<typeof request.agent>;
  let editorAgent: ReturnType<typeof request.agent>;
  let viewerAgent: ReturnType<typeof request.agent>;
  let publishedSongIds: number[];
  let draftSongId: number;
  let resourcesUploadDir: string;

  async function login(agent: ReturnType<typeof request.agent>, email: string) {
    await agent.post('/api/auth/login').send({ email, password: 'Admin123!' }).expect(200);
  }

  async function seedFixtures() {
    await pool.query(`
      TRUNCATE
        resources,
        correction_suggestions,
        song_revisions,
        lineup_songs,
        lineups,
        song_tags,
        songs,
        tags,
        categories,
        users,
        roles
      RESTART IDENTITY CASCADE
    `);

    await pool.query(`INSERT INTO roles (name) VALUES ('admin'), ('editor'), ('viewer')`);
    const passwordHash = await hashPassword('Admin123!');

    for (const [email, role] of [
      ['admin@example.com', 'admin'],
      ['editor@example.com', 'editor'],
      ['viewer@example.com', 'viewer']
    ]) {
      await pool.query(
        `INSERT INTO users (email, password_hash, display_name, role_id)
         SELECT $1, $2, $3, id FROM roles WHERE name = $4`,
        [email, passwordHash, role, role]
      );
    }

    const categoryResult = await pool.query<{ id: number }>(
      `INSERT INTO categories (name, slug, sort_order)
       VALUES ('Worship', 'worship', 1)
       RETURNING id`
    );
    const categoryId = categoryResult.rows[0].id;
    const adminResult = await pool.query<{ id: number }>(`SELECT id FROM users WHERE email = 'admin@example.com'`);
    const adminId = adminResult.rows[0].id;
    const songsResult = await pool.query<{ id: number; status: string }>(
      `INSERT INTO songs (title, artist, song_key, slug, content, category_id, status, created_by, updated_by)
       VALUES
         ('Alpha Song', 'Artist', 'C', 'alpha-song', 'C   G', $1, 'published', $2, $2),
         ('Beta Song', 'Artist', 'D', 'beta-song', 'D   A', $1, 'published', $2, $2),
         ('Draft Song', 'Artist', 'E', 'draft-song', 'E   B', $1, 'draft', $2, $2)
       RETURNING id, status`,
      [categoryId, adminId]
    );

    publishedSongIds = songsResult.rows.filter((song) => song.status === 'published').map((song) => song.id);
    draftSongId = songsResult.rows.find((song) => song.status === 'draft')!.id;
    adminAgent = request.agent(app);
    editorAgent = request.agent(app);
    viewerAgent = request.agent(app);
    await login(adminAgent, 'admin@example.com');
    await login(editorAgent, 'editor@example.com');
    await login(viewerAgent, 'viewer@example.com');
  }

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.JWT_SECRET = 'integration-test-secret';
    process.env.NODE_ENV = 'test';
    process.env.CLIENT_ORIGIN = 'http://localhost:5173';
    resourcesUploadDir = await mkdtemp(path.join(tmpdir(), 'music-chords-resources-'));
    process.env.RESOURCES_UPLOAD_DIR = resourcesUploadDir;

    const [{ createApp }, database, security] = await Promise.all([
      import('../app'),
      import('../config/db'),
      import('../utils/security')
    ]);
    const schemaSql = await readFile(fileURLToPath(new URL('../../../database/schema.sql', import.meta.url)), 'utf8');

    app = createApp();
    pool = database.pool;
    hashPassword = security.hashPassword;
    await pool.query(schemaSql);
  });

  beforeEach(async () => {
    await seedFixtures();
  });

  afterAll(async () => {
    await pool?.end();
    await rm(resourcesUploadDir, { recursive: true, force: true });
  });

  it('reports liveness and database readiness separately', async () => {
    await request(app).get('/api/health').expect(200, { status: 'ok' });
    await request(app).get('/api/ready').expect(200, { status: 'ready' });
  });

  it('hides drafts from public search and exposes them to editors', async () => {
    const publicResponse = await request(app).get('/api/songs').expect(200);
    expect(publicResponse.body.items.map((song: { slug: string }) => song.slug)).toEqual(['alpha-song', 'beta-song']);

    const editorResponse = await editorAgent.get('/api/songs?status=draft').expect(200);
    expect(editorResponse.body.items.map((song: { slug: string }) => song.slug)).toEqual(['draft-song']);
  });

  it('rejects malformed ids before they reach PostgreSQL', async () => {
    await request(app)
      .post('/api/songs/not-a-number/suggestions')
      .send({ message: 'Fix chord', proposedContent: 'C   G' })
      .expect(400);
    await adminAgent.delete('/api/categories/not-a-number').expect(400);
  });

  it('enforces role permissions', async () => {
    await viewerAgent.post('/api/categories').send({ name: 'Youth', slug: 'youth', sortOrder: 2 }).expect(403);
    await editorAgent.patch(`/api/songs/${publishedSongIds[0]}/pin`).send({ pinned: true }).expect(403);
  });

  it('creates revisions and allows admins to pin songs', async () => {
    const createdResponse = await editorAgent
      .post('/api/songs')
      .send({
        title: 'Created Song',
        artist: 'Artist',
        key: 'F',
        slug: 'created-song',
        content: 'F   C',
        tagIds: [],
        status: 'published'
      })
      .expect(201);
    const songId = createdResponse.body.item.id;

    await editorAgent
      .put(`/api/songs/${songId}`)
      .send({
        title: 'Created Song',
        artist: 'Artist',
        key: 'F',
        slug: 'created-song',
        content: 'F   C   Dm',
        tagIds: [],
        status: 'published',
        revisionNote: 'Added final chord'
      })
      .expect(200);

    const revisionsResponse = await editorAgent.get(`/api/songs/${songId}/revisions`).expect(200);
    expect(revisionsResponse.body.items).toHaveLength(1);

    const pinResponse = await adminAgent.patch(`/api/songs/${songId}/pin`).send({ pinned: true }).expect(200);
    expect(pinResponse.body.item.isPinned).toBe(true);
  });

  it('preserves lineup ordering and rejects draft songs', async () => {
    const createdResponse = await editorAgent
      .post('/api/lineups')
      .send({ title: 'Sunday', songIds: [...publishedSongIds].reverse() })
      .expect(201);

    expect(createdResponse.body.item.songs.map((song: { id: number }) => song.id)).toEqual([...publishedSongIds].reverse());

    await editorAgent.post('/api/lineups').send({ title: 'Invalid', songIds: [draftSongId] }).expect(400);
  });

  it('prevents category hierarchy cycles', async () => {
    const parentResponse = await adminAgent.post('/api/categories').send({ name: 'Parent', slug: 'parent', sortOrder: 2 }).expect(201);
    const childResponse = await adminAgent
      .post('/api/categories')
      .send({ name: 'Child', slug: 'child', parentId: parentResponse.body.item.id, sortOrder: 3 })
      .expect(201);

    await adminAgent
      .put(`/api/categories/${parentResponse.body.item.id}`)
      .send({ name: 'Parent', slug: 'parent', parentId: childResponse.body.item.id, sortOrder: 2 })
      .expect(400);
  });

  it('allows admins to publish text resources while other roles remain read-only', async () => {
    const payload = { title: 'Sunday Notes', slug: 'sunday-notes', bodyText: 'Opening prayer\nC   G' };

    await viewerAgent.post('/api/resources/text').send(payload).expect(403);
    await editorAgent.post('/api/resources/text').send(payload).expect(403);

    const createResponse = await adminAgent.post('/api/resources/text').send(payload).expect(201);
    expect(createResponse.body.item).toMatchObject({ title: 'Sunday Notes', slug: 'sunday-notes', kind: 'text' });

    const listResponse = await request(app).get('/api/resources').expect(200);
    expect(listResponse.body.items).toHaveLength(1);

    const detailResponse = await request(app).get('/api/resources/sunday-notes').expect(200);
    expect(detailResponse.body.item.bodyText).toBe('Opening prayer\nC   G');

    await editorAgent.patch(`/api/resources/${createResponse.body.item.id}`).send({ title: 'Editor Rename' }).expect(403);

    const renameResponse = await adminAgent
      .patch(`/api/resources/${createResponse.body.item.id}`)
      .send({ title: 'Updated Sunday Notes' })
      .expect(200);
    expect(renameResponse.body.item).toMatchObject({ title: 'Updated Sunday Notes', slug: 'sunday-notes' });
  });

  it('stores admin PDF uploads, streams them publicly, and deletes them', async () => {
    const pdfBody = Buffer.from('%PDF-1.4\n%%EOF\n');
    const createResponse = await adminAgent
      .post('/api/resources/pdf?title=Practice%20Checklist&slug=practice-checklist&filename=practice.pdf')
      .set('Content-Type', 'application/pdf')
      .send(pdfBody)
      .expect(201);

    expect(createResponse.body.item).toMatchObject({ slug: 'practice-checklist', kind: 'pdf', originalFilename: 'practice.pdf' });

    const pdfResponse = await request(app).get('/api/resources/practice-checklist/pdf').expect(200);
    expect(pdfResponse.headers['content-type']).toContain('application/pdf');
    expect(pdfResponse.headers['x-frame-options']).toBeUndefined();
    expect(pdfResponse.headers['content-security-policy']).toBe("frame-ancestors 'self' http://localhost:5173");
    expect(pdfResponse.headers['cross-origin-resource-policy']).toBe('cross-origin');

    await editorAgent.delete(`/api/resources/${createResponse.body.item.id}`).expect(403);
    await adminAgent.delete(`/api/resources/${createResponse.body.item.id}`).expect(200);
    await request(app).get('/api/resources/practice-checklist').expect(404);
  });

  it('rejects files that do not have a PDF signature', async () => {
    await adminAgent
      .post('/api/resources/pdf?title=Invalid&slug=invalid&filename=invalid.pdf')
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from('not a pdf'))
      .expect(400);
  });

  it('stores admin image uploads and streams them publicly', async () => {
    const pngBody = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const createResponse = await adminAgent
      .post('/api/resources/image?title=Event%20Poster&slug=event-poster&filename=poster.png')
      .set('Content-Type', 'image/png')
      .send(pngBody)
      .expect(201);

    expect(createResponse.body.item).toMatchObject({ slug: 'event-poster', kind: 'image', originalFilename: 'poster.png' });

    const imageResponse = await request(app).get('/api/resources/event-poster/image').expect(200);
    expect(imageResponse.headers['content-type']).toContain('image/png');
    expect(imageResponse.headers['cross-origin-resource-policy']).toBe('cross-origin');

    await editorAgent.delete(`/api/resources/${createResponse.body.item.id}`).expect(403);
  });

  it('rejects files that do not have a supported image signature', async () => {
    await adminAgent
      .post('/api/resources/image?title=Invalid&slug=invalid-image&filename=invalid.png')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('not an image'))
      .expect(400);
  });
});
