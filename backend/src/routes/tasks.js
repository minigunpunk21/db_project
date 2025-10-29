import { Router } from 'express';
import { pool, withActor } from '../db.js';
export const router = Router();

router.get('/', async (req, res) => {
  const project = req.query.project || null;
  const project_id = req.query.project_id ? +req.query.project_id : null;
  const status = req.query.status || null;
  const priority = req.query.priority || null;
  const [rows] = await pool.execute(
    `SELECT t.task_id, p.project_id, p.name AS project, t.title, t.status, t.priority, t.due_date,
            r.user_id AS reporter_id, r.login AS reporter, a.user_id AS assignee_id, a.login AS assignee
     FROM tasks t
     JOIN projects p ON p.project_id = t.project_id
     JOIN users r    ON r.user_id    = t.reporter_id
     LEFT JOIN users a ON a.user_id  = t.assignee_id
     WHERE (? IS NULL OR p.name = ?)
       AND (? IS NULL OR p.project_id = ?)
       AND (? IS NULL OR t.status = ?)
       AND (? IS NULL OR t.priority = ?)
     ORDER BY t.due_date IS NULL, t.due_date ASC, t.priority DESC`,
     [project, project, project_id, project_id, status, status, priority, priority]
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = +req.params.id;
  const [[task]] = await pool.query(
    `SELECT t.*, p.name AS project, r.login AS reporter, a.login AS assignee
     FROM tasks t
     JOIN projects p ON p.project_id=t.project_id
     JOIN users r ON r.user_id=t.reporter_id
     LEFT JOIN users a ON a.user_id=t.assignee_id
     WHERE t.task_id=?`, [id]
  );
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const [comments] = await pool.query(
    `SELECT c.comment_id, c.body, c.created_at, c.edited_at, u.user_id, u.login
     FROM comments c JOIN users u ON u.user_id=c.author_id
     WHERE c.task_id=? ORDER BY c.created_at ASC`, [id]
  );
  const [logs] = await pool.query(
    `SELECT l.log_id, l.occurred_at, l.actor_id, u.login AS actor_login, l.action, l.details_json
     FROM logs l LEFT JOIN users u ON u.user_id=l.actor_id
     WHERE l.entity_type='task' AND l.entity_id=?
     ORDER BY l.occurred_at DESC, l.log_id DESC LIMIT 300`, [id]
  );
  res.json({ task, comments, logs });
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await withActor(conn, req.user?.user_id);
    const { project_id, title, description, status, priority, estimated_minutes, due_date, reporter_id, assignee_id } = req.body;
    const [r] = await conn.execute(
      `INSERT INTO tasks (project_id,title,description,status,priority,estimated_minutes,due_date,reporter_id,assignee_id,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,NOW(3))`,
      [project_id, title, description || null, status, priority, estimated_minutes || null, due_date || null, reporter_id, assignee_id || null]
    );
    await conn.commit();
    res.status(201).json({ task_id: r.insertId });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});

router.patch('/:id', async (req, res) => {
  const id = +req.params.id;
  const fields = ['title','description','status','priority','estimated_minutes','due_date','assignee_id'];
  const updates = []; const params = [];
  for (const f of fields) if (f in req.body) { updates.push(`${f} = ?`); params.push(req.body[f]); }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  params.push(id);
  const conn = await pool.getConnection();
  try {
    await withActor(conn, req.user?.user_id);
    const [r] = await conn.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE task_id = ?`, params);
    res.json({ affected: r.affectedRows });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { conn.release(); }
});

router.delete('/:id', async (req, res) => {
  const id = +req.params.id;
  const conn = await pool.getConnection();
  try {
    await withActor(conn, req.user?.user_id);
    const [r] = await conn.execute(`DELETE FROM tasks WHERE task_id = ?`, [id]);
    res.json({ affected: r.affectedRows });
  } catch (e) { res.status(500).json({ error: e.message }); }
  finally { conn.release(); }
});
