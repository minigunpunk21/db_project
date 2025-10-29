import React from 'react'
export default function Modal({ open, onClose, title, children }){
  if(!open) return null
  return (<div className="fixed inset-0 z-30 grid place-items-center p-3">
    <div className="absolute inset-0 bg-black/30" onClick={onClose} />
    <div className="card relative w-full max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <button className="btn btn-ghost" onClick={onClose}>✕</button>
      </div>{children}
    </div>
  </div>)
}