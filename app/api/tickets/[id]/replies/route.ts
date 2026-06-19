import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/tickets/[id]/replies — fetch all replies for a ticket
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const replies = await prisma.reply.findMany({
    where: { ticketId: id },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(replies)
}

// POST /api/tickets/[id]/replies — add a new human reply
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  if (!body.message || !body.message.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  const reply = await prisma.reply.create({
    data: {
      message: body.message,
      author: session.user?.name || session.user?.email || 'Support Agent',
      ticketId: id,
    },
  })

  return NextResponse.json(reply, { status: 201 })
}