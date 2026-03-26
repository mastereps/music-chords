import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0)
});
