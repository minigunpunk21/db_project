import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});
export async function withActor(conn, actorId){ await conn.query('SET @actor_id = ?', [actorId ?? null]); }
