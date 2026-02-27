'use client'

import { useEffect, useState } from 'react'

export default function Navbar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) setUser(JSON.parse(userStr))
  }, [])

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
      <div className="text-slate-500 text-sm font-medium">
        Overview / <span className="text-slate-900">Master Data RT</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-bold text-slate-900 leading-none">{user?.nama || 'Admin'}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">{user?.role_code || 'Operator'}</div>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-400 overflow-hidden">
          {user?.nama?.charAt(0) || <div className="w-full h-full bg-blue-600 ring-2 ring-blue-100" />}
        </div>
      </div>
    </header>
  )
}
