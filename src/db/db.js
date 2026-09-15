import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function query(text, params) {
  return pool.query(text, params);
}



export async function closePool() {
  await pool.end();
}

export default pool;
