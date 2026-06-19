import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// GET /api/tickets/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}

// PATCH /api/tickets/[id] — update status OR generate AI response
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  // ----- Generate AI response -----
  if (body.generateAI) {
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const prompt = `You are a professional customer support agent. Write an empathetic, clear, and actionable response to this support ticket. Use plain paragraphs or numbered steps where helpful. Be specific and friendly. Do not use markdown formatting like ** or #.

Ticket: ${ticket.ticketNumber}
Title: ${ticket.title}
Category: ${ticket.category}
Priority: ${ticket.priority}

Description:
${ticket.description}

Write a professional support response.`

      const result = await model.generateContent(prompt)
      const aiResponse = result.response.text()

      await prisma.ticket.update({
        where: { id },
        data: { aiResponse },
      })
    } catch (err: any) {
      console.error('Gemini API error:', err)
      return NextResponse.json(
        { error: 'AI generation failed: ' + (err?.message || 'Unknown error') },
        { status: 500 }
      )
    }
  }
  // ----- Update status -----
  else if (body.status) {
    await prisma.ticket.update({
      where: { id },
      data: { status: body.status },
    })
  }

  // ALWAYS fetch and return the complete, fresh ticket — guarantees
  // title, description, status, aiResponse, user, etc. are never missing
  const finalTicket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json(finalTicket)
}

// DELETE /api/tickets/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.ticket.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}