import { z } from 'zod';

const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

const createCommentarySchema = z.object({
  minutes: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().nonnegative(),
  period: z.string().min(1),
  eventType: z.string().min(1),
  actor: z.string().min(1),
  team: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.any()),
  tags: z.array(z.string(), z.any()),
});

export {
  listCommentaryQuerySchema,
  createCommentarySchema,
  matchIdParamSchema,
};
