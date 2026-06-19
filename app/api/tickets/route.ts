import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tickets — fetch all tickets (supports ?status= and ?search=)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const tickets = await prisma.ticket.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { ticketNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(tickets)
}

// POST /api/tickets — create a new ticket
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, description, category, priority } = body

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  const count = await prisma.ticket.count()
  const ticketNumber = `TKT-${String(count + 1).padStart(3, '0')}`

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,
      title,
      description,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'open',
      userId: (session.user as any).id,
    },
  })

  return NextResponse.json(ticket, { status: 201 })
}