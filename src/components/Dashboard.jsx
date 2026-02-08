import React, { useState } from 'react'

const OPTIONS = [
  { key: 'expenses', label: 'Top 3 expenses' },
  { key: 'transactions', label: 'Top 3 transactions' },
  { key: 'income', label: 'Top 3 income events' }
]

export default function Dashboard({
  topExpenses = [],
  topTransactions = [],
  topIncome = [],
  selectedMonthIndex = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
  onChangeMonth = () => {},
  onChangeYear = () => {}
}){
  const [view, setView] = useState('expenses')

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const years = Array.from({ length: 7 }, (_, i) => selectedYear - 3 + i)

  const list = view === 'expenses'
    ? topExpenses
    : view === 'income'
      ? topIncome
      : topTransactions

  const label = OPTIONS.find(o => o.key === view)?.label || 'Top 3'

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h2>Overview</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={selectedMonthIndex} onChange={(e) => onChangeMonth(Number(e.target.value))}>
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => onChangeYear(Number(e.target.value))}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', margin: '8px 0 12px' }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.key}
            className={`btn ${view === opt.key ? 'btn-primary' : ''}`}
            onClick={() => setView(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="small">No transactions recorded for this view.</p>
      ) : (
        <div>
          <p className="small">{label} this month</p>
          <ul style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {list.map(tx => (
              <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{tx.description || tx.category || 'Transaction'}</span>
                <span style={{ fontWeight: 600, color: tx.transaction_type === 'expense' ? '#ef4444' : '#111827' }}>
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(tx.amount || 0)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
