'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/tickets', label: 'All Tickets', icon: '🎫' },
  { href: '/tickets/new', label: 'New Ticket', icon: '➕' },
]

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 p-4">
      <div className="flex items-center gap-2 mb-7 px-1">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-base shrink-0">🎧</div>
        <span className="font-semibold text-slate-900 text-sm">SupportDesk</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(item => {
          const active =
            pathname === item.href ||
            (item.href === '/tickets' && pathname.startsWith('/tickets/') && pathname !== '/tickets/new')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-white text-slate-900 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-3 border-t border-slate-200">
        <div className="px-2 mb-2 text-xs text-slate-500 truncate">{userEmail}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  )
}