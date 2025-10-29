import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();
router.get('/db', async (_req, res) => {
  try{
    const [[info]] = await pool.query('SELECT DATABASE() AS db, VERSION() AS ver');
    const [[u]] = await pool.query('SELECT COUNT(*) AS users FROM users');
    const [[t]] = await pool.query('SELECT COUNT(*) AS tasks FROM tasks');
    res.json({ ok: true, db: info.db, version: info.ver, users: u.users, tasks: t.tasks });
  }catch(e){ res.status(500).json({ ok: false, error: e.message }); }
});
