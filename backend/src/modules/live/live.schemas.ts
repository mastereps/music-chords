import { z } from 'zod';

export const liveStateInputSchema = z.object({
  active: z.boolean(),
  path: z.string().trim().min(1).max(500).startsWith('/').optional(),
  scrollPct: z.number().min(0).max(1).optional(),
  songView: z
    .object({
      offset: z.number().int().min(-11).max(11),
      fontSize: z.number().int().min(10).max(40)
    })
    .nullable()
    .optional()
});
