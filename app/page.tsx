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

  const recent = await prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const metrics = [
    { label: 'Total', value: total, color: '#1e293b' },
    { label: 'Open', value: open, color: '#2563eb' },
    { label: 'In Progress', value: inProgress, color: '#d97706' },
    { label: 'Resolved', value: resolved, color: '#16a34a' },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: '#f8fafc', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600 }}>Recent Tickets</h2>
        <Link href="/tickets" style={{ fontSize: 13, color: '#4f46e5' }}>View all →</Link>
      </div>

      {recent.length === 0 ? (
        <p style={{ fontSize: 13, color: '#94a3b8' }}>No tickets yet.</p>
      ) : (
        recent.map(t => (
          <Link
            key={t.id}
            href={`/tickets/${t.id}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit' }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.ticketNumber}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</div>
            </div>
            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: '#eff6ff', color: '#1d4ed8' }}>
              {t.status}
            </span>
          </Link>
        ))
      )}
    </div>
  )
}