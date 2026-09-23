import * as z from "zod"; 
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

const isoString = z.string().refine((val) => isoDateRegex.test(val) && !isNaN(Date.parse(val)), {
  message: 'Invalid ISO date string',
});

const createMatchSchema = z
  .object({
    sport: z.string().min(1),

    homeTeamId: z.coerce.number().int().positive(),
    awayTeamId: z.coerce.number().int().positive(),

    startTime: isoString,
    endTime: isoString,

    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const s = Date.parse(data.startTime);
    const e = Date.parse(data.endTime);

    if (isNaN(s) ||   isNaN(e)) return;

    if (e <= s) {
      ctx.addIssue({
        code: 'custom',
        message: 'endTime must be after startTime',
        path: ['endTime'],
      });
    }

    if (data.homeTeamId === data.awayTeamId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Home team and away team must be different',
        path: ['awayTeamId'],
      });
    }
  });

const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});

export {
  listMatchesQuerySchema,
  MATCH_STATUS,
  createMatchSchema,
  updateScoreSchema,
};
