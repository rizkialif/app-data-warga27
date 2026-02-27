'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Database, LogOut, ChevronRight } from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Master Data RT', icon: Database, href: '/dashboard/rt' },
  { name: 'Data Warga', icon: Users, href: '/dashboard/warga' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all">
      <div className="p-6">
        <div className="flex items-center gap-3 text-blue-600 font-bold text-xl uppercase tracking-wider">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            W
          </div>
          DataWarga
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-blue-50 text-blue-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                {item.name}
              </div>
              <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          Keluar
        </button>
      </div>
    </aside>
  )
}
