'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const FILTERS = ['all', 'open', 'in-progress', 'resolved', 'closed']

export default function TicketsPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'

  const [tickets, setTickets] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(initialStatus)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/tickets?${params}`)
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, filter])

  const statusStyles: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
  }
  const priorityStyles: Record<string, string> = {
    urgent: 'bg-orange-50 text-orange-700',
    high: 'bg-red-50 text-red-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-green-50 text-green-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-slate-900">All Tickets</h1>
        <Link
          href="/tickets/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Ticket
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search tickets…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No tickets found.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {tickets.map(t => (
            <Link
              key={t.id}
              href={`/tickets/${t.id}`}
              className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs text-slate-400">{t.ticketNumber}</div>
                <div className="text-sm font-medium text-slate-900 truncate">{t.title}</div>
                <div className="text-xs text-slate-400">{t.category}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[t.status] || 'bg-slate-100 text-slate-600'}`}>
                  {t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityStyles[t.priority] || ''}`}>
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}