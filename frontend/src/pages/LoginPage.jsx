import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { API } from '../lib/api.js'
export default function LoginPage({ onLogin }){
  const nav = useNavigate()
  const [login, setLogin] = useState('alice')
  const [password, setPassword] = useState('alice123')
  const [busy, setBusy] = useState(false)
  async function submit(e){
    e.preventDefault(); setBusy(true)
    try {
      const r = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ login, password }) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Login failed')
      onLogin(j.token); toast.success('Welcome, '+j.user.login); nav('/kanban')
    } catch (e){ toast.error(e.message) } finally { setBusy(false) }
  }
  return (<div className="max-w-md mx-auto mt-10 card p-6">
    <h2 className="text-xl font-semibold mb-2">Sign in</h2>
    <p className="text-sm text-slate-500 mb-4">Demo: alice/alice123, carol/carol123, dave/dave123, erin/erin123</p>
    <form onSubmit={submit} className="grid gap-3">
      <input className="input" value={login} onChange={e=>setLogin(e.target.value)} placeholder="login" />
      <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
      <button className="btn btn-primary" disabled={busy}>{busy?'…':'Login'}</button>
    </form>
  </div>)
}