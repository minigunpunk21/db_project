import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
export const router = Router();
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

router.post('/login', async (req, res) => {
  const { login, password } = req.body || {};
  if(!login || !password) return res.status(400).json({ error: 'login and password required' });
  const [rows] = await pool.query('SELECT user_id, login, email, password_hash, first_name, last_name FROM users WHERE login=? AND is_active=1', [login]);
  const u = rows[0];
  if(!u) return res.status(401).json({ error: 'Invalid credentials' });
  if (sha256(password) !== u.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ user_id: u.user_id, login: u.login }, process.env.JWT_SECRET || 'change_me_strong', { expiresIn: '12h' });
  res.json({ token, user: { user_id: u.user_id, login: u.login, email: u.email } });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if(!token) return res.json({ user: null });
  try{ const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_me_strong'); res.json({ user: payload }); }
  catch{ res.json({ user: null }); }
});
