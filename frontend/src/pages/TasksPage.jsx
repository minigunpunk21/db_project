import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API, authHeaders, localDate } from '../lib/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
export default function TasksPage({ token }){
  const [rows, setRows] = useState([])
  const [projectFilter, setProjectFilter] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const today = useMemo(() => localDate(), [])

  async function load(){
    const qs = new URLSearchParams()
    if (projectFilter) qs.set('project', projectFilter)
    if (status) qs.set('status', status)
    if (priority) qs.set('priority', priority)
    const url = `${API}/tasks${qs.toString() ? '?'+qs.toString() : ''}`
    const data = await fetch(url, { headers: authHeaders(token) }).then(r=>r.json())
    setRows(data)
  }
  async function loadProjects(){ const data = await fetch(`${API}/projects`, { headers: authHeaders(token) }).then(r=>r.json()); setProjects(data) }
  async function loadUsers(){ const data = await fetch(`${API}/users`, { headers: authHeaders(token) }).then(r=>r.json()); setUsers(data) }

  useEffect(()=>{ load(); loadProjects(); loadUsers(); }, [])

  async function onCreate(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      project_id: +form.get('project_id'),
      title: form.get('title'),
      description: form.get('description') || null,
      status: form.get('status') || 'todo',
      priority: form.get('priority') || 'normal',
      estimated_minutes: form.get('estimated_minutes') ? +form.get('estimated_minutes') : null,
      due_date: form.get('due_date') || null,
      reporter_id: +form.get('reporter_id'),
      assignee_id: form.get('assignee_id') ? +form.get('assignee_id') : null
    }
    try{
      const r = await fetch(`${API}/tasks`, { method:'POST', headers:{'Content-Type':'application/json', ...authHeaders(token)}, body: JSON.stringify(body)})
      const j = await r.json(); if (!r.ok) throw new Error(j.error); toast.success(`Task #${j.task_id} created`); await load(); e.currentTarget.reset()
    }catch(e){ toast.error(e.message) }
  }

  return (<div className="space-y-4">
    <div className="glass p-3 grid md:grid-cols-4 gap-3 items-end">
      <div><label className="form">Project (filter)</label><input value={projectFilter} onChange={e=>setProjectFilter(e.target.value)} className="input" placeholder="Project name"/></div>
      <div><label className="form">Status</label><input value={status} onChange={e=>setStatus(e.target.value)} className="input"/></div>
      <div><label className="form">Priority</label><input value={priority} onChange={e=>setPriority(e.target.value)} className="input"/></div>
      <button onClick={load} className="btn btn-primary">Load</button>
    </div>

    <div className="overflow-x-auto card">
      <table className="min-w-full">
        <thead className="text-left text-slate-500 text-sm"><tr>
          <th className="p-2">ID</th><th className="p-2">Project</th><th className="p-2">Title</th><th className="p-2">Status</th><th className="p-2">Priority</th><th className="p-2">Due</th><th className="p-2">Assignee</th>
        </tr></thead>
        <tbody>{rows.map(r=> (
          <tr key={r.task_id} className="border-t hover:bg-white/70 dark:hover:bg-slate-900/40">
            <td className="p-2"><Link className="underline" to={`/tasks/${r.task_id}`}>{r.task_id}</Link></td>
            <td className="p-2">{r.project}</td>
            <td className="p-2">{r.title}</td>
            <td className="p-2"><StatusBadge value={r.status}/></td>
            <td className="p-2">{r.priority}</td>
            <td className="p-2">{r.due_date ?? '—'}</td>
            <td className="p-2">{r.assignee ?? '—'}</td>
          </tr>))}
        </tbody>
      </table>
    </div>

    <div className="p-4 card">
      <h3 className="font-semibold mb-3">Create task</h3>
      <form onSubmit={onCreate} className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-3">
          <label className="form">Project</label>
          <select name="project_id" className="input" required>
            <option value="" hidden>Choose project…</option>
            {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="form">Title</label>
          <input name="title" placeholder="title" className="input" required/>
        </div>
        <div>
          <label className="form">Status</label>
          <select name="status" className="input" defaultValue="todo">
            <option value="todo">todo</option><option value="in_progress">in_progress</option><option value="review">review</option><option value="blocked">blocked</option><option value="done">done</option>
          </select>
        </div>
        <div>
          <label className="form">Priority</label>
          <select name="priority" className="input" defaultValue="normal">
            <option value="low">low</option><option value="normal">normal</option><option value="high">high</option><option value="urgent">urgent</option>
          </select>
        </div>
        <div>
          <label className="form">Due date</label>
          <input name="due_date" type="date" className="input" min="{today}"/>
        </div>
        <div>
          <label className="form">Estimated (minutes)</label>
          <input name="estimated_minutes" type="number" className="input" min="1" placeholder="e.g. 120"/>
        </div>
        <div>
          <label className="form">Reporter</label>
          <select name="reporter_id" className="input" required>
            <option value="" hidden>Choose reporter…</option>
            {users.map(u => <option key={u.user_id} value={u.user_id}>{u.login}</option>)}
          </select>
        </div>
        <div>
          <label className="form">Assignee (optional)</label>
          <select name="assignee_id" className="input">
            <option value="">— unassigned —</option>
            {users.map(u => <option key={u.user_id} value={u.user_id}>{u.login}</option>)}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="form">Description</label>
          <textarea name="description" className="input" placeholder="Short description…"></textarea>
        </div>
        <div className="sm:col-span-3"><button className="btn btn-primary">Create</button></div>
      </form>
    </div>
  </div>)
}