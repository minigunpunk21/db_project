import { Router } from 'express';
import { pool } from '../db.js';
export const router = Router();
router.get('/', async (req, res)=>{
  const entityType = req.query.entity_type || 'task';
  const entityId = req.query.entity_id ? +req.query.entity_id : null;
  const [rows] = await pool.execute(
    `SELECT l.log_id, l.occurred_at, l.actor_id, u.login AS actor_login, l.entity_type, l.entity_id, l.action, l.details_json
     FROM logs l LEFT JOIN users u ON u.user_id = l.actor_id
     WHERE l.entity_type = ? AND (? IS NULL OR l.entity_id = ?)
     ORDER BY l.occurred_at DESC, l.log_id DESC LIMIT 300`,
     [entityType, entityId, entityId]
  );
  res.json(rows);
});
