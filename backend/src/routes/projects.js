import { Router } from 'express';
import { pool, withActor } from '../db.js';
export const router = Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.project_id, p.name, p.status, p.start_date, p.due_date,
            COUNT(t.task_id) AS task_count, SUM(t.status='done') AS done_count
     FROM projects p
     LEFT JOIN tasks t ON t.project_id=p.project_id
     GROUP BY p.project_id, p.name, p.status, p.start_date, p.due_date
     ORDER BY p.name`
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, description, start_date, due_date, status } = req.body || {};
  if(!name || !status) return res.status(400).json({ error: 'name and status required' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await withActor(conn, req.user?.user_id);
    const [r] = await conn.execute(
      `INSERT INTO projects (name, description, start_date, due_date, status) VALUES (?,?,?,?,?)`,
      [name, description || null, start_date || null, due_date || null, status]
    );
    await conn.commit();
    res.status(201).json({ project_id: r.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});
