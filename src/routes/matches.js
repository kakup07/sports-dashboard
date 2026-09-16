import { Router } from 'express';
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js';
import { createMatch, listMatches } from '../models/matches.js';
import { getMatchStatus } from '../utils/match_team.js';

export const matchRouter = new Router()
const MAX_LIMIT = 100
matchRouter.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query)

  if(!parsed.success){
    return res.status(400).json({
      error: 'Invalid Query', 
      details: parsed.error.issues
    })
  }
  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

  try {
    const data = await listMatches({limit})
    return res.status(201).json({ data: JSON.stringify(data[0])})
  } catch (e) {
    console.log(`Match router list failed with error :: ${e}`)
    return res.status(500).json({error: 'failed to list matches'})
  }
})

matchRouter.post('/', async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid Payload',
      details: parsed.error.issues,
    });
  }

  const {
    data: {
      homeTeamId: home_team,
      awayTeamId: away_team,
      sport,
      startTime: start_time,
      endTime: end_time,
      homeScore: home_score,
      awayScore: away_score,
    },
  } = parsed;
  try {
    const result = await createMatch({
      start_time: new Date(start_time),
      home_team,
      away_team,
      sport,
      end_time: new Date(end_time),
      home_score: home_score ?? 0,
      away_score: away_score ?? 0,
      status: getMatchStatus(start_time, end_time)
    })
    if(res.app.locals.broadcastMatchCreated){
      res.app.locals.broadcastMatchCreated(result)
    }

    res.status(201).json({ data: result })
  }
  catch(e) {
    console.log(`Match POST failed with error :: ${e}`)
    res.status(500).json({error: 'Failed to create match.'})
  }

})