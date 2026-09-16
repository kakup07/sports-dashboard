import { query } from '../db/db.js';

export async function createMatch({sport, home_team, away_team, status, start_time, end_time, home_score, away_score}) {
  const result = await query(
    `INSERT INTO matches (sport, home_team, away_team, status, start_time, end_time, home_score, away_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [sport, home_team, away_team, status, start_time, end_time, home_score, away_score]
  );

  return result.rows[0];
}

export async function listMatches({ limit }) {

  const result = await query(
    `SELECT *
     FROM matches
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}