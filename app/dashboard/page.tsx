import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [total, open, inProgress, resolved] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'open' } }),
    prisma.ticket.count({ where: { status: 'in-progress' } }),
    prisma.ticket.count({ where: { status: 'resolved' } }),
  ])

  const recent = await prisma.ticket.findMany({ take: 5, orderBy: { createdAt: 'desc' } })

  const metrics = [
    { label: 'Total', value: total, color: 'text-slate-900', filter: 'all' },
    { label: 'Open', value: open, color: 'text-blue-600', filter: 'open' },
    { label: 'In Progress', value: inProgress, color: 'text-amber-600', filter: 'in-progress' },
    { label: 'Resolved', value: resolved, color: 'text-green-600', filter: 'resolved' },
  ]

  const statusStyles: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900 mb-5">Dashboard</h1>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {metrics.map(m => (
          <Link
            key={m.label}
            href={m.filter === 'all' ? '/tickets' : `/tickets?status=${m.filter}`}
            className="bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-4 block"
          >
            <div className="text-xs text-slate-500 mb-1">{m.label}</div>
            <div className={`text-2xl font-semibold ${m.color}`}>{m.value}</div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Recent Tickets</h2>
        <Link href="/tickets" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          View all →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-slate-400">No tickets yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {recent.map(t => (
            <Link
              key={t.id}
              href={`/tickets/${t.id}`}
              className="flex items-center justify-between py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-xs text-slate-400">{t.ticketNumber}</div>
                <div className="text-sm font-medium text-slate-900 truncate">{t.title}</div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[t.status] || 'bg-slate-100 text-slate-600'}`}>
                {t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}