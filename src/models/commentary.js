import { query } from '../db/db.js';

export async function listCommentary({matchId, limit}){
  const result = await query(`select * from commentary where match_id = $1 order by created_at DESC limit $2`, [matchId, limit])
  return result.rows
}

export async function createCommentary({
  match_id,
  minutes,
  sequence,
  period,
  event_type,
  actor,
  team,
  message,
  metadata,
  tags,
}) {
  const result = await query(
    `INSERT INTO commentary (
      match_id,
      minutes,
      sequence,
      period,
      event_type,
      actor,
      team,
      message,
      metadata,
      tags
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [match_id, minutes, sequence, period, event_type, actor, team, message, metadata, tags]
  );

  return result.rows[0];
}
