import type { Request, Response } from 'express';

import type { TextResourceInput } from '@music-chords/shared';

import { env } from '../../config/env';
import { AppError, assertFound } from '../../utils/http';
import {
  createPdfResource as createPdfResourceRecord,
  createImageResource as createImageResourceRecord,
  createTextResource as createTextResourceRecord,
  deleteResource as deleteResourceRecord,
  getPdfResourcePath,
  getImageResourcePath,
  getResourceBySlug,
  listResources
} from './resources.service';
import {
  imageResourceQuerySchema,
  pdfResourceQuerySchema,
  resourceParamsSchema,
  resourceSlugParamsSchema,
  textResourceSchema
} from './resources.schemas';

export async function getResources(_req: Request, res: Response) {
  res.status(200).json({ items: await listResources() });
}

export async function getResource(req: Request, res: Response) {
  const { slug } = resourceSlugParamsSchema.parse(req.params);
  res.status(200).json({ item: assertFound(await getResourceBySlug(slug), 'Resource not found') });
}

export async function getResourcePdf(req: Request, res: Response) {
  const { slug } = resourceSlugParamsSchema.parse(req.params);
  const pdf = await getPdfResourcePath(slug);

  res.type('application/pdf');
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${env.CLIENT_ORIGIN}`);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Disposition', `inline; filename="${pdf.filename.replace(/[\r\n"]/g, '')}"`);
  res.sendFile(pdf.path);
}

export async function getResourceImage(req: Request, res: Response) {
  const { slug } = resourceSlugParamsSchema.parse(req.params);
  const image = await getImageResourcePath(slug);

  res.type(image.mimeType);
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Disposition', `inline; filename="${image.filename.replace(/[\r\n"]/g, '')}"`);
  res.sendFile(image.path);
}

export async function createTextResource(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = textResourceSchema.parse(req.body);
  res.status(201).json({ item: await createTextResourceRecord(payload as TextResourceInput, req.authUser) });
}

export async function createPdfResource(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = pdfResourceQuerySchema.parse(req.query);

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    throw new AppError('PDF file is required.', 400);
  }

  res.status(201).json({ item: await createPdfResourceRecord(payload, req.body, req.authUser) });
}

export async function createImageResource(req: Request, res: Response) {
  if (!req.authUser) {
    throw new AppError('Authentication required', 401);
  }

  const payload = imageResourceQuerySchema.parse(req.query);

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    throw new AppError('Image file is required.', 400);
  }

  res.status(201).json({ item: await createImageResourceRecord(payload, req.body, req.authUser) });
}

export async function deleteResource(req: Request, res: Response) {
  const { id } = resourceParamsSchema.parse(req.params);
  await deleteResourceRecord(id);
  res.status(200).json({ message: 'Resource deleted' });
}
