import { z } from 'zod';

export const lineupParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const lineupSchema = z.object({
  title: z.string().trim().min(1, 'Lineup title is required'),
  description: z.string().trim().nullable().optional(),
  songIds: z
    .array(z.number().int().positive())
    .min(1, 'Add at least one song before saving this lineup.')
    .refine((value) => new Set(value).size === value.length, 'Duplicate songs are not allowed in a lineup')
});
