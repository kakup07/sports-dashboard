import { query } from '../db/db.js';

export async function createTeam(name, city) {
  const result = await query(
    `INSERT INTO teams (name, city)
     VALUES ($1, $2)
     RETURNING id, name, city, created_at`,
    [name, city]
  );

  return result.rows[0];
}

export async function getAllTeams() {
  const result = await query(
    `SELECT id, name, city, created_at
     FROM teams
     ORDER BY id ASC`
  );

  return result.rows;
}

export async function getTeamById(id) {
  const result = await query(
    `SELECT id, name, city, created_at
     FROM teams
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function updateTeam(id, name, city) {
  const result = await query(
    `UPDATE teams
     SET name = $1,
         city = $2
     WHERE id = $3
     RETURNING id, name, city, created_at`,
    [name, city, id]
  );

  return result.rows[0] || null;
}

export async function deleteTeam(id) {
  const result = await query(
    `DELETE FROM teams
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  return result.rowCount > 0;
}
