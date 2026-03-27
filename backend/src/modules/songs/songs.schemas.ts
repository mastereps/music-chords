import { z } from 'zod';

export const songSchema = z.object({
  title: z.string().trim().min(1),
  artist: z.string().trim().nullable().optional(),
  key: z.string().trim().min(1),
  slug: z.string().trim().min(1).regex(/^[a-z0-9-]+$/),
  content: z.string().refine((value) => value.trim().length > 0, 'Content is required'),
  categoryId: z.number().int().positive().nullable().optional(),
  tagIds: z.array(z.number().int().positive()).default([]).refine((value) => new Set(value).size === value.length, 'Duplicate tags are not allowed'),
  language: z.string().trim().nullable().optional(),
  status: z.enum(['draft', 'published']),
  revisionNote: z.string().trim().nullable().optional()
});

export const suggestionSchema = z.object({
  contactName: z.string().trim().nullable().optional(),
  message: z.string().trim().min(1),
  proposedContent: z.string().refine((value) => value.trim().length > 0, 'Suggested content is required')
});

export const songSearchSchema = z.object({
  q: z.string().trim().optional().transform((value) => value || undefined),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.coerce.number().int().positive().optional(),
  artist: z.string().trim().optional().transform((value) => value || undefined),
  tag: z.string().trim().optional().transform((value) => value || undefined),
  language: z.string().trim().optional().transform((value) => value || undefined),
  status: z.enum(['draft', 'published']).optional()
});
