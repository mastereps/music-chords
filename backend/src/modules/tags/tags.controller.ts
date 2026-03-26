import type { Request, Response } from 'express';
import { z } from 'zod';

import { createTag as createTagRecord, listTags } from './tags.service.js';

const tagSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/)
});

export async function getTags(_req: Request, res: Response) {
  const tags = await listTags();
  res.status(200).json({ items: tags });
}

export async function createTag(req: Request, res: Response) {
  const payload = tagSchema.parse(req.body);
  const tag = await createTagRecord(payload.name, payload.slug);
  res.status(201).json({ item: tag });
}
