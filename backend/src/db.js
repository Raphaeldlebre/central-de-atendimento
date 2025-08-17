import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;
export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}
