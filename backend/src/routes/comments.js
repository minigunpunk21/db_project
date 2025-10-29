import { Router } from 'express';
import { pool, withActor } from '../db.js';
export const router = Router();

router.get('/task/:taskId', async (req, res) => {
  const taskId = +req.params.taskId;
  const [rows] = await pool.query(
    `SELECT c.comment_id, c.body, c.created_at, c.edited_at, u.user_id, u.login
     FROM comments c JOIN users u ON u.user_id=c.author_id
     WHERE c.task_id=? ORDER BY c.created_at ASC`, [taskId]
  );
  res.json(rows);
});

router.post('/task/:taskId', async (req, res) => {
  const taskId = +req.params.taskId;
  const { author_id, body } = req.body;
  if (!author_id || !body) return res.status(400).json({ error: 'author_id and body required' });
  const conn = await pool.getConnection();
  try {
    await withActor(conn, req.user?.user_id);
    const [r] = await conn.execute(`INSERT INTO comments (task_id, author_id, body, created_at) VALUES (?,?,?,NOW(3))`, [taskId, author_id, body]);
    res.status(201).json({ comment_id: r.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { conn.release(); }
});
