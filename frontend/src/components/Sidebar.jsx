import React from 'react'
import { Kanban, FolderKanban, ListTodo } from 'lucide-react'
import { NavLink } from 'react-router-dom'
const Item = ({ to, icon:Icon, children }) => (
  <NavLink to={to} className={({isActive}) => `glass flex items-center gap-2 px-3 py-2 mb-2 hover:bg-white/80 dark:hover:bg-slate-900/70 transition ${isActive?'ring-2 ring-brand-600':''}`}>
    <Icon size={18}/><span>{children}</span>
  </NavLink>)
export default function Sidebar(){ return (<div className="space-y-2">
  <Item to="/projects" icon={FolderKanban}>Projects</Item>
  <Item to="/kanban" icon={Kanban}>Kanban</Item>
  <Item to="/tasks" icon={ListTodo}>Tasks</Item>
</div>) }