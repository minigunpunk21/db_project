import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
export default function Layout({ auth, children }){
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  useEffect(()=>{ document.documentElement.classList.toggle('dark', theme==='dark'); localStorage.setItem('theme', theme) }, [theme])
  return (<div className="min-h-screen">
    <div className="fixed inset-0 -z-10 opacity-[0.25] pointer-events-none">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-600 rounded-full blur-[180px]"></div>
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[180px]"></div>
    </div>
    <Topbar theme={theme} setTheme={setTheme} auth={auth} />
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 grid grid-cols-12 gap-4">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2"><Sidebar /></aside>
      <section className="col-span-12 md:col-span-9 lg:col-span-10">{children}</section>
    </div>
  </div>)
}