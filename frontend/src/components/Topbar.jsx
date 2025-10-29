import React from 'react'
import { LogOut, LogIn, User2, Sun, Moon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
export default function Topbar({ theme, setTheme, auth }){
  const nav = useNavigate()
  return (<header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-slate-900/60 border-b border-white/50 dark:border-white/10">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex items-center gap-4">
      <Link to="/projects" className="flex items-center gap-2 font-bold text-lg">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-brand-600 text-white">TM</span> TaskManager
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <button className="btn btn-ghost" onClick={()=> setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
        {auth.me ? (<>
          <span className="hidden sm:flex items-center gap-1 text-sm"><User2 size={16}/> {auth.me.login}</span>
          <button className="btn btn-primary" onClick={()=>{ auth.logout(); nav('/login') }}><LogOut size={16}/> Logout</button>
        </>) : (<Link to="/login" className="btn btn-primary"><LogIn size={16}/> Login</Link>)}
      </div>
    </div>
  </header>)
}