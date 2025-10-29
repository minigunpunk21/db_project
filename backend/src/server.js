import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { requireAuth } from './middleware/authz.js';
import { router as authRouter } from './routes/auth.js';
import { router as usersRouter } from './routes/users.js';
import { router as tasksRouter } from './routes/tasks.js';
import { router as logsRouter } from './routes/logs.js';
import { router as projectsRouter } from './routes/projects.js';
import { router as commentsRouter } from './routes/comments.js';
import { router as diagRouter } from './routes/diag.js';

const app = express();
app.use(cors());
app.use(express.json());

// open endpoints
app.get('/api/health', (_, res)=> res.json({ ok: true }));

// guard: everything else under /api requires auth, except /api/auth and /api/health
app.use((req, res, next)=>{
  if (req.path.startsWith('/api/health') || req.path.startsWith('/api/auth')) return next();
  return requireAuth(req, res, next);
});

// routers (now protected by the guard above, except /api/auth & /api/health)
app.use('/api/health', diagRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/logs', logsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/comments', commentsRouter);

const port = +(process.env.PORT || 3001);
app.listen(port, ()=> console.log(`API on http://localhost:${port}`));
