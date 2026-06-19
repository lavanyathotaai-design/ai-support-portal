'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTicketPage() {
  const [form, setForm] = useState({ title: '', description: '', category: 'Technical', priority: 'medium' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.description) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const ticket = await res.json()
      router.push(`/tickets/${ticket.id}`)
    } else {
      setError('Failed to create ticket.')
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-slate-900 mb-5">Create New Ticket</h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Title *</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Brief summary…"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Describe the issue…"
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className={inputClass}
            >
              {['Technical', 'Billing', 'Authentication', 'Bug', 'Feature Request', 'How-To', 'Other'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className={inputClass}
            >
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating…' : 'Create Ticket'}
        </button>
      </form>
    </div>
  )
}