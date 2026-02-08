import React, { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'

function buildContextSummary({ projectedIncome = 0, currentMonthIncomeToDate = 0, expensesByCategory = {}, targets = {} }) {
  const totalExpenses = Object.values(expensesByCategory).reduce((s, v) => s + (v || 0), 0)
  const net = currentMonthIncomeToDate - totalExpenses
  const topCats = Object.entries(expensesByCategory)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0))
    .slice(0, 3)
    .map(([k, v]) => `${k}: $${(v || 0).toFixed(2)}`)
    .join(', ')

  return {
    totalExpenses,
    net,
    topCats
  }
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function localAdvisorResponse(context) {
  const { projectedIncome, currentMonthIncomeToDate, expensesByCategory } = context
  const { totalExpenses, net, topCats } = buildContextSummary(context)

  const hints = []
  if (projectedIncome > 0 && totalExpenses > projectedIncome) {
    hints.push(`Your spending ($${totalExpenses.toFixed(2)}) exceeds projected income ($${projectedIncome.toFixed(2)}).`)
  } else if (projectedIncome > 0) {
    const saved = Math.max(0, projectedIncome - totalExpenses)
    hints.push(`Projected savings: $${saved.toFixed(2)}.`)
  }
  if (topCats) {
    hints.push(`Top spending categories: ${topCats || 'N/A'}.`)
  }

  return [
    `Quick budget snapshot:`,
    `• Actual income: $${currentMonthIncomeToDate.toFixed(2)}`,
    `• Actual expenses: $${totalExpenses.toFixed(2)}`,
    `• Net: $${net.toFixed(2)}`,
    ...hints
  ].join('\n')
}

export default function AiAdvisorDrawer({
  open = false,
  onClose = () => {},
  projectedIncome = 0,
  currentMonthIncomeToDate = 0,
  expensesByCategory = {},
  targets = {}
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const context = useMemo(
    () => ({ projectedIncome, currentMonthIncomeToDate, expensesByCategory, targets }),
    [projectedIncome, currentMonthIncomeToDate, expensesByCategory, targets]
  )

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'assistant', content: 'Ask me about spending, saving, or budget trade-offs. I’ll use your current month context.' }
      ])
    }
  }, [open, messages.length])

  if (!open) return null

  async function handleSend() {
    const text = input.trim()
    if (!text) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')

    try {
      const res = await fetch(`${API_BASE}/api/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, context })
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Failed to get advice')
      }

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'No response.' }])
    } catch (err) {
      const fallback = localAdvisorResponse(context)
      setMessages(prev => [...prev, { role: 'assistant', content: `Network error. Showing local advice:\n${fallback}` }])
    }
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer" style={{ width: '520px' }}>
        <div className="drawer-header">
          <h3>Budget Advisor</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#e0f2fe' : '#f3f4f6',
                  color: '#111827',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  maxWidth: '90%',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.role === 'assistant' ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your budget..."
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
            />
            <button className="btn btn-primary" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
