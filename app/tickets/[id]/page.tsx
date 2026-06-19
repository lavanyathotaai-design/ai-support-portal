'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const STATUSES = ['open', 'in-progress', 'resolved', 'closed']

export default function TicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadTicket()
    loadReplies()
  }, [id])

  function loadTicket() {
    fetch(`/api/tickets/${id}`)
      .then(r => r.json())
      .then(data => { setTicket(data); setStatus(data.status) })
  }

  function loadReplies() {
    fetch(`/api/tickets/${id}/replies`)
      .then(r => r.json())
      .then(data => setReplies(Array.isArray(data) ? data : []))
  }

  async function updateStatus() {
    setSaving(true)
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setTicket(await res.json())
    setSaving(false)
  }

  async function generateAI() {
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateAI: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error || 'AI generation failed. Please try again in a minute.')
      } else {
        setTicket(data)
      }
    } catch {
      setAiError('Network error. Please try again.')
    }
    setAiLoading(false)
  }

  async function sendReply() {
    if (!replyText.trim()) return
    setSendingReply(true)
    const res = await fetch(`/api/tickets/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: replyText }),
    })
    if (res.ok) {
      setReplyText('')
      loadReplies()
    }
    setSendingReply(false)
  }

  function useAIResponseAsReply() {
    if (ticket?.aiResponse) setReplyText(ticket.aiResponse)
  }

  if (!ticket) return <p className="text-sm text-slate-400">Loading…</p>

  const statusStyles: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-amber-50 text-amber-700',
    resolved: 'bg-green-50 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
  }

  return (
    <div>
      <button
        onClick={() => router.push('/tickets')}
        className="border border-slate-200 text-slate-600 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors mb-4"
      >
        ← Back to tickets
      </button>

      <h1 className="text-base font-semibold text-slate-900 mb-2">{ticket.title}</h1>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{ticket.ticketNumber}</span>
        <span className={`px-2.5 py-0.5 rounded-full font-medium ${statusStyles[ticket.status] || ''}`}>
          {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </span>
        <span>{ticket.category}</span>
      </div>

      {/* Description */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Description</div>
        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
      </div>

      {/* AI Suggestion */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-slate-900">🧠 AI Suggested Response</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Gemini</span>
        </div>

        {aiError && (
          <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-lg mb-3">{aiError}</div>
        )}

        {aiLoading ? (
          <p className="text-sm text-slate-400">Generating a response…</p>
        ) : ticket.aiResponse ? (
          <>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{ticket.aiResponse}</p>
            <button
              onClick={useAIResponseAsReply}
              className="bg-white border border-indigo-200 text-indigo-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              📋 Use as Reply
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-400">Click below to generate a suggested response.</p>
        )}

        {!ticket.aiResponse && (
          <button
            onClick={generateAI}
            disabled={aiLoading}
            className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
          >
            ✨ {aiLoading ? 'Generating…' : 'Generate AI Response'}
          </button>
        )}
      </div>

      {/* Conversation */}
      <div className="bg-slate-50 rounded-xl p-4 mb-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Support Conversation ({replies.length})
        </div>

        {replies.length === 0 ? (
          <p className="text-sm text-slate-400 mb-3">No replies yet. Be the first to respond.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {replies.map(r => (
              <div key={r.id} className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-900">{r.author}</span>
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="Type your reply to the customer…"
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
        />
        <button
          onClick={sendReply}
          disabled={sendingReply || !replyText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {sendingReply ? 'Sending…' : 'Send Reply'}
        </button>
      </div>

      {/* Status */}
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Update Status</div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>
              {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={updateStatus}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Status'}
        </button>
      </div>
    </div>
  )
}