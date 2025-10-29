import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API, authHeaders } from '../lib/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
export default function TaskDetailPage({ token }){
  const { id } = useParams()
  const [data, setData] = useState(null)
  async function load(){
    const r = await fetch(`${API}/tasks/${id}`, { headers: authHeaders(token) })
    if (!r.ok){ toast.error('Task not found'); return }
    setData(await r.json())
  }
  useEffect(()=>{ load() }, [id])
  async function onComment(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = { author_id:+form.get('author_id'), body:form.get('body') }
    try{
      const r = await fetch(`${API}/comments/task/${id}`, { method:'POST', headers:{'Content-Type':'application/json', ...authHeaders(token)}, body: JSON.stringify(body)})
      const j = await r.json(); if(!r.ok) throw new Error(j.error); toast.success('Comment added'); await load(); e.currentTarget.reset()
    }catch(e){ toast.error(e.message) }
  }
  if (!data) return <div className="card p-4">Loading…</div>
  const { task, comments, logs } = data
  return (<div className="grid gap-4">
    <div className="card">
      <div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">Task #{task.task_id} — {task.title}</h2><div className="text-sm text-slate-500">{task.project}</div></div><StatusBadge value={task.status}/></div>
      <dl className="grid sm:grid-cols-3 gap-x-6 mt-3 text-sm">
        <div><dt className="text-slate-500">Priority</dt><dd className="font-medium">{task.priority}</dd></div>
        <div><dt className="text-slate-500">Due</dt><dd className="font-medium">{task.due_date ?? '—'}</dd></div>
        <div><dt className="text-slate-500">Reporter</dt><dd className="font-medium">{task.reporter}</dd></div>
        <div><dt className="text-slate-500">Assignee</dt><dd className="font-medium">{task.assignee ?? '—'}</dd></div>
      </dl>
    </div>
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card">
        <h3 className="font-semibold mb-2">Comments</h3>
        <ul className="space-y-2 mb-4">{comments.map(c => (
          <li key={c.comment_id} className="border rounded-xl p-2 bg-white/70 dark:bg-slate-900/40">
            <div className="text-sm text-slate-600 dark:text-slate-300">{c.login} · {c.created_at}</div><div>{c.body}</div>
          </li>))}
        </ul>
        <form onSubmit={onComment} className="grid gap-2">
          <input name="author_id" placeholder="author_id" className="input" required/>
          <textarea name="body" placeholder="Your comment…" className="input" required></textarea>
          <button className="btn btn-primary">Add comment</button>
        </form>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Activity log</h3>
        <ul className="space-y-2 max-h-[420px] overflow-auto pr-2">{logs.map(l => (
          <li key={l.log_id} className="border rounded-xl p-2 bg-white/70 dark:bg-slate-900/40">
            <div className="text-sm text-slate-600 dark:text-slate-300">{l.occurred_at} — <b>{l.action}</b> {l.actor_login ? `by ${l.actor_login}` : ''}</div>
            <pre className="text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded overflow-auto">{JSON.stringify(l.details_json, null, 2)}</pre>
          </li>))}
        </ul>
      </div>
    </div>
  </div>)
}