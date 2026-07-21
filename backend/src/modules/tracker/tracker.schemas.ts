import { z } from 'zod';

export const trackerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const trackerStudentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  // Not an enum: the instrument registry in the frontend is the single place instruments are added,
  // so widening it must not require a matching backend change.
  instrument: z.string().trim().min(1).max(40)
});

export const trackerItemSchema = z.object({
  kind: z.enum(['skill', 'piece', 'passage']),
  name: z.string().trim().min(1).max(200),
  status: z.enum(['not_started', 'lacking', 'passed']).default('not_started'),
  attempts: z.coerce.number().int().min(0).default(0),
  notes: z.string().trim().max(2000).default('')
});

/** All optional — an empty patch is a valid "still passes today" re-confirmation. */
export const trackerItemPatchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  status: z.enum(['not_started', 'lacking', 'passed']).optional(),
  attempts: z.coerce.number().int().min(0).optional(),
  notes: z.string().trim().max(2000).optional()
});
