import { z } from 'zod';
const MAX_LIMIT = 100
const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
});

const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

const createCommentarySchema = z.object({
  minutes: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().nonnegative(),
  period: z.string().min(1).optional(),
  eventType: z.string().min(1),
  actor: z.string().min(1).optional(),
  team: z.string().min(1).optional(),
  message: z.string().min(1),
  metadata: z.record(z.any()),
  tags: z.array(z.string()).default([]),
});

export {
  listCommentaryQuerySchema,
  createCommentarySchema,
  matchIdParamSchema,
};
