import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();
router.get('/', async (_req, res)=>{
  const [rows] = await pool.query('SELECT user_id, login, email, first_name, last_name, is_active FROM users ORDER BY login');
  res.json(rows);
});
