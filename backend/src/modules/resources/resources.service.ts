import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { AuthUser, Resource, ResourceKind, TextResourceInput } from '@music-chords/shared';

import { query } from '../../config/db';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { AppError, assertFound } from '../../utils/http';

interface ResourceRow {
  id: number;
  title: string;
  slug: string;
  kind: ResourceKind;
  body_text: string | null;
  stored_filename: string | null;
  original_filename: string | null;
  mime_type: string | null;
  byte_size: number | null;
  created_at: string;
  updated_at: string;
}

function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    kind: row.kind,
    bodyText: row.body_text,
    originalFilename: row.original_filename,
    byteSize: row.byte_size,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function isPdfBuffer(buffer: Buffer) {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-';
}

function detectImage(buffer: Buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: 'png', mimeType: 'image/png' };
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }

  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { extension: 'webp', mimeType: 'image/webp' };
  }

  return null;
}

export async function listResources() {
  const result = await query<ResourceRow>(
    `SELECT id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text
     FROM resources
     ORDER BY updated_at DESC, id DESC`
  );

  return result.rows.map(mapResource);
}

export async function getResourceBySlug(slug: string) {
  const result = await query<ResourceRow>(
    `SELECT id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text
     FROM resources
     WHERE slug = $1`,
    [slug]
  );

  return result.rows[0] ? mapResource(result.rows[0]) : null;
}

export async function createTextResource(input: TextResourceInput, actor: AuthUser) {
  const result = await query<ResourceRow>(
    `INSERT INTO resources (title, slug, kind, body_text, created_by, updated_by)
     VALUES ($1, $2, 'text', $3, $4, $4)
     RETURNING id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text`,
    [input.title, input.slug, input.bodyText, actor.id]
  );

  return mapResource(result.rows[0]);
}

export async function createPdfResource(
  input: { title: string; slug: string; filename: string },
  buffer: Buffer,
  actor: AuthUser
) {
  if (!isPdfBuffer(buffer)) {
    throw new AppError('The uploaded file is not a valid PDF.', 400);
  }

  await mkdir(env.RESOURCES_UPLOAD_DIR, { recursive: true });

  const storedFilename = `${randomUUID()}.pdf`;
  const storedPath = path.resolve(env.RESOURCES_UPLOAD_DIR, storedFilename);

  await writeFile(storedPath, buffer, { flag: 'wx', mode: 0o600 });

  try {
    const result = await query<ResourceRow>(
      `INSERT INTO resources (
         title, slug, kind, stored_filename, original_filename, mime_type, byte_size, created_by, updated_by
       ) VALUES ($1, $2, 'pdf', $3, $4, 'application/pdf', $5, $6, $6)
       RETURNING id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text`,
      [input.title, input.slug, storedFilename, input.filename, buffer.length, actor.id]
    );

    return mapResource(result.rows[0]);
  } catch (error) {
    await rm(storedPath, { force: true });
    throw error;
  }
}

export async function createImageResource(
  input: { title: string; slug: string; filename: string },
  buffer: Buffer,
  actor: AuthUser
) {
  const image = detectImage(buffer);

  if (!image) {
    throw new AppError('The uploaded file is not a valid JPEG, PNG, or WebP image.', 400);
  }

  await mkdir(env.RESOURCES_UPLOAD_DIR, { recursive: true });

  const storedFilename = `${randomUUID()}.${image.extension}`;
  const storedPath = path.resolve(env.RESOURCES_UPLOAD_DIR, storedFilename);

  await writeFile(storedPath, buffer, { flag: 'wx', mode: 0o600 });

  try {
    const result = await query<ResourceRow>(
      `INSERT INTO resources (
         title, slug, kind, stored_filename, original_filename, mime_type, byte_size, created_by, updated_by
       ) VALUES ($1, $2, 'image', $3, $4, $5, $6, $7, $7)
       RETURNING id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text`,
      [input.title, input.slug, storedFilename, input.filename, image.mimeType, buffer.length, actor.id]
    );

    return mapResource(result.rows[0]);
  } catch (error) {
    await rm(storedPath, { force: true });
    throw error;
  }
}

export async function getPdfResourcePath(slug: string) {
  const result = await query<Pick<ResourceRow, 'stored_filename' | 'original_filename' | 'kind'>>(
    `SELECT kind, stored_filename, original_filename
     FROM resources
     WHERE slug = $1`,
    [slug]
  );
  const resource = assertFound(result.rows[0], 'Resource not found');

  if (resource.kind !== 'pdf' || !resource.stored_filename) {
    throw new AppError('This resource is not a PDF.', 400);
  }

  return {
    path: path.resolve(env.RESOURCES_UPLOAD_DIR, resource.stored_filename),
    filename: resource.original_filename ?? 'resource.pdf'
  };
}

export async function getImageResourcePath(slug: string) {
  const result = await query<Pick<ResourceRow, 'stored_filename' | 'original_filename' | 'mime_type' | 'kind'>>(
    `SELECT kind, stored_filename, original_filename, mime_type
     FROM resources
     WHERE slug = $1`,
    [slug]
  );
  const resource = assertFound(result.rows[0], 'Resource not found');

  if (resource.kind !== 'image' || !resource.stored_filename || !resource.mime_type) {
    throw new AppError('This resource is not an image.', 400);
  }

  return {
    path: path.resolve(env.RESOURCES_UPLOAD_DIR, resource.stored_filename),
    filename: resource.original_filename ?? 'resource-image',
    mimeType: resource.mime_type
  };
}

export async function renameResource(id: number, title: string, actor: AuthUser) {
  const result = await query<ResourceRow>(
    `UPDATE resources
     SET title = $2, updated_by = $3
     WHERE id = $1
     RETURNING id, title, slug, kind, body_text, stored_filename, original_filename, mime_type, byte_size, created_at::text, updated_at::text`,
    [id, title, actor.id]
  );

  return mapResource(assertFound(result.rows[0], 'Resource not found'));
}

export async function deleteResource(id: number) {
  const result = await query<Pick<ResourceRow, 'stored_filename'>>(
    `DELETE FROM resources
     WHERE id = $1
     RETURNING stored_filename`,
    [id]
  );
  const resource = assertFound(result.rows[0], 'Resource not found');

  if (resource.stored_filename) {
    await rm(path.resolve(env.RESOURCES_UPLOAD_DIR, resource.stored_filename), { force: true }).catch((error: unknown) => {
      logger.warn('Unable to remove deleted resource file', {
        filename: resource.stored_filename,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    });
  }
}
