import { z } from 'zod';

const slugSchema = z.string().trim().min(1).max(255).regex(/^[a-z0-9-]+$/);

export const resourceParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const resourceSlugParamsSchema = z.object({
  slug: slugSchema
});

export const textResourceSchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: slugSchema,
  bodyText: z.string().max(200_000).refine((value) => value.trim().length > 0, 'Document text is required')
});

export const pdfResourceQuerySchema = z.object({
  title: z.string().trim().min(1).max(255),
  slug: slugSchema,
  filename: z.string().trim().min(1).max(255)
});

export const imageResourceQuerySchema = pdfResourceQuerySchema;
