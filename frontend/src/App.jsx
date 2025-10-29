import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import TaskDetailPage from './pages/TaskDetailPage.jsx'
import KanbanPage from './pages/KanbanPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { API } from './lib/api.js'

function useAuth(){
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [me, setMe] = useState(null)
  const [checked, setChecked] = useState(false)
  useEffect(()=>{
    async function run(){
      if (!token) { setMe(null); setChecked(true); return }
      try{ const r = await fetch(`${API}/auth/me`, { headers:{Authorization:`Bearer ${token}`}}); const d = await r.json(); setMe(d.user||null) }
      catch{ setMe(null) } finally { setChecked(true) }
    } run()
  }, [token])
  function login(t){ localStorage.setItem('token', t); setToken(t) }
  function logout(){ localStorage.removeItem('token'); setToken(''); setMe(null) }
  return { token, me, checked, login, logout }
}
function Private({ me, checked, children }){
  if (!checked) return <div className="p-6">Loading…</div>;
  if (!me) return <Navigate to="/login" replace />;
  return children;
}
export default function App(){
  const auth = useAuth()
  return (<>
    <Layout auth={auth}>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" />} />
        <Route path="/login" element={<LoginPage onLogin={auth.login} />} />
        <Route path="/projects" element={<Private me={auth.me} checked={auth.checked}><ProjectsPage token={auth.token} /></Private>} />
        <Route path="/tasks" element={<Private me={auth.me} checked={auth.checked}><TasksPage token={auth.token} /></Private>} />
        <Route path="/tasks/:id" element={<Private me={auth.me} checked={auth.checked}><TaskDetailPage token={auth.token} /></Private>} />
        <Route path="/kanban" element={<Private me={auth.me} checked={auth.checked}><KanbanPage token={auth.token} me={auth.me} /></Private>} />
      </Routes>
    </Layout>
    <Toaster position="top-right" />
  </>)
}