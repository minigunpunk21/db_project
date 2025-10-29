import React, { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { API, authHeaders, localDate } from '../lib/api.js'
export default function ProjectsPage({ token }){
  const [rows, setRows] = useState([]); const [show, setShow] = useState(false)
  const today = useMemo(() => localDate(), [])
  async function load(){ const data = await fetch(`${API}/projects`, { headers: authHeaders(token) }).then(r=>r.json()); setRows(data) }
  useEffect(()=>{ load() }, [])
  async function onCreate(e){
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = { name: form.get('name'), description: form.get('description')||null, start_date: form.get('start_date')||null, due_date: form.get('due_date')||null, status: form.get('status')||'planned' }
    try{
      const r = await fetch(`${API}/projects`, { method:'POST', headers:{ 'Content-Type':'application/json', ...authHeaders(token) }, body: JSON.stringify(body) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error); toast.success(`Project #${j.project_id} created`); setShow(false); load()
    }catch(e){ toast.error(e.message) }
  }
  return (<div className="space-y-4">
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h2 className="text-xl font-semibold">Projects</h2>
      <button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={16}/> New Project</button>
    </div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map(p => (<div key={p.project_id} className="card p-4">
        <div className="flex items-center justify-between"><div className="text-lg font-semibold">{p.name}</div><StatusBadge value={p.status}/></div>
        <div className="mt-2 text-sm text-slate-500">Start: {p.start_date ?? '—'} · Due: {p.due_date ?? '—'}</div>
        <div className="mt-3 text-sm"><b>{p.task_count}</b> tasks, <b>{p.done_count}</b> done</div>
      </div>))}
    </div>
    <Modal open={show} onClose={()=>setShow(false)} title="Create Project">
      <form onSubmit={onCreate} className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="form">Name</label>
          <input name="name" placeholder="Name" className="input" required/>
        </div>
        <div>
          <label className="form">Status</label>
          <select name="status" className="input" defaultValue="planned">
            <option value="planned">planned</option><option value="active">active</option><option value="paused">paused</option><option value="archived">archived</option>
          </select>
        </div>
        <div>
          <label className="form">Start date</label>
          <input name="start_date" type="date" className="input" defaultValue={today} />
        </div>
        <div>
          <label className="form">Due date</label>
          <input name="due_date" type="date" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="form">Description</label>
          <textarea name="description" placeholder="Description" className="input"></textarea>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={()=>setShow(false)}>Cancel</button>
        </div>
      </form>
    </Modal>
  </div>)
}