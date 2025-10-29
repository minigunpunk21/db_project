import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { API, authHeaders } from '../lib/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
const STATUSES = ['todo','in_progress','review','blocked','done']
const titles = { todo:'Backlog', in_progress:'In Progress', review:'Review', blocked:'Blocked', done:'Done' }
export default function KanbanPage({ token }){
  const [project, setProject] = useState('Website Revamp')
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [dragId, setDragId] = useState(null)
  async function load(){
    const qs = new URLSearchParams(); if (project) qs.set('project', project)
    const data = await fetch(`${API}/tasks?${qs}`, { headers: authHeaders(token) }).then(r=>r.json())
    setTasks(data)
  }
  async function loadUsers(){ const u = await fetch(`${API}/users`, { headers: authHeaders(token) }).then(r=>r.json()); setUsers(u) }
  useEffect(()=>{ load(); loadUsers(); }, [project])
  const columns = useMemo(()=>{ const col = {}; STATUSES.forEach(s=> col[s]=[]); for (const t of tasks) col[t.status]?.push(t); return col }, [tasks])
  function onDragStart(ev, id){ ev.dataTransfer.setData('text/plain', String(id)); setDragId(id) }
  function onDrop(ev, status){ ev.preventDefault(); const id = +ev.dataTransfer.getData('text/plain'); moveTask(id, status); setDragId(null) }
  function allowDrop(ev){ ev.preventDefault() }
  async function moveTask(task_id, status){ try{ const r = await fetch(`${API}/tasks/${task_id}`, { method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders(token)}, body: JSON.stringify({ status }) }); if (!r.ok){ const j=await r.json(); throw new Error(j.error) } toast.success(`Task #${task_id} → ${status}`); load() }catch(e){ toast.error(e.message) } }
  async function reassign(task_id, assignee_id){ try{ const r = await fetch(`${API}/tasks/${task_id}`, { method:'PATCH', headers:{'Content-Type':'application/json', ...authHeaders(token)}, body: JSON.stringify({ assignee_id }) }); if (!r.ok){ const j=await r.json(); throw new Error(j.error) } toast.success(`Assigned #${task_id}`); load() }catch(e){ toast.error(e.message) } }
  return (<div className="space-y-4">
    <div className="glass p-3 flex flex-wrap gap-3 items-center"><h2 className="text-xl font-semibold">Kanban</h2><input value={project} onChange={e=>setProject(e.target.value)} className="input max-w-xs" placeholder="Project name"/><div className="text-sm text-slate-500">Drag cards to change status. Use select to assign.</div></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {STATUSES.map(s => (<div key={s} className={`card p-3 min-h-[55vh]`} onDragOver={allowDrop} onDrop={e=>onDrop(e,s)}>
        <div className="flex items-center justify-between mb-2"><div className="col-title">{titles[s]}</div><div className="badge border-slate-200 bg-white/70 dark:bg-slate-900/40">{columns[s].length}</div></div>
        <div className="space-y-3">
          {columns[s].map(t => (<motion.div key={t.task_id} layout className={`p-3 border rounded-xl bg-white/80 dark:bg-slate-900/50 shadow-sm cursor-move`} draggable onDragStart={e=>onDragStart(e, t.task_id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="text-xs text-slate-500">#{t.task_id} · {t.project}</div>
            <div className="font-medium">{t.title}</div>
            <div className="flex items-center gap-2 mt-2"><StatusBadge value={t.status} /><span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">{t.priority}</span><span className="text-xs text-slate-500">{t.due_date ?? 'no due'}</span></div>
            <div className="mt-2"><label className="text-xs text-slate-500">Assignee</label><select className="input w-full" value={t.assignee_id || ''} onChange={e=>reassign(t.task_id, e.target.value ? +e.target.value : null)}><option value="">— unassigned —</option>{users.map(u=> <option key={u.user_id} value={u.user_id}>{u.login}</option>)}</select></div>
          </motion.div>))}
        </div>
      </div>))}
    </div>
  </div>)
}