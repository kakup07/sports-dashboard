import pool from './db.js';


export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      sport TEXT NOT NULL,
      home_team INTEGER NOT NULL REFERENCES teams (id),
      away_team INTEGER NOT NULL REFERENCES teams (id),
      status match_status NOT NULL DEFAULT 'scheduled',
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ,
      home_score INTEGER NOT NULL DEFAULT 0 CHECK (home_score >= 0),
      away_score INTEGER NOT NULL DEFAULT 0 CHECK (away_score >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT different_match_teams CHECK (home_team <> away_team),
      CONSTRAINT valid_match_times CHECK (end_time IS NULL OR end_time >= start_time)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS commentary (
      id SERIAL PRIMARY KEY,
      match_id INTEGER NOT NULL REFERENCES matches (id) ON DELETE CASCADE,
      minute INTEGER CHECK (minute >= 0),
      sequence INTEGER NOT NULL CHECK (sequence >= 0),
      period TEXT,
      event_type TEXT NOT NULL,
      actor TEXT,
      team TEXT,
      message TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}