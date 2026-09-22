import { Router } from 'express';
import { createCommentarySchema, listCommentaryQuerySchema, matchIdParamSchema } from '../validation/commentary.js';
import { createCommentary, listCommentary } from '../models/commentary.js';

const commentaryRoute = Router({ mergeParams: true });
const MAX_LIMIT = 100
commentaryRoute.get('/', async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid match id',
      details: paramsResult.error.issues,
    });
  }

  //max limit 100
  const queryResult = listCommentaryQuerySchema.safeParse(req.query)
  if(!queryResult.success){
    return res.status(400).json({
      error: 'Limit out of bound'
    })
  }
  const id = req.params.id
  const limit = Math.min(req.query.limit ?? 50, 100)
  const data = await listCommentary({limit, id})
  res.status(200).json({data})
})

commentaryRoute.post('/', async (req, res) => {
  console.log()
  const paramsResult = matchIdParamSchema.safeParse(req.params);

  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid match id',
      details: paramsResult.error.issues,
    });
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      error: 'Invalid commentary payload',
      details: bodyResult.error.issues,
    });
  }

  try {
    const result = await createCommentary({
      match_id: paramsResult.data.id,
      minutes: bodyResult.data.minutes,
      sequence: bodyResult.data.sequence,
      period: bodyResult.data.period,
      event_type: bodyResult.data.eventType,
      actor: bodyResult.data.actor,
      team: bodyResult.data.team,
      message: bodyResult.data.message,
      metadata: bodyResult.data.metadata,
      tags: bodyResult.data.tags,
    });

    console.log('commentary create log -- ', JSON.stringify(result, null, 2))
    if(res.app.locals.broadcastCommentary){
      console.log('broadcast called')
      res.app.locals.broadcastCommentary(result.match_id, result)
    }

    return res.status(201).json({ data: result });
  } catch (error) {
    console.error('Commentary creation failed:', error);
    return res.status(500).json({ error: 'Failed to create commentary' });
  }
});

export default commentaryRoute;