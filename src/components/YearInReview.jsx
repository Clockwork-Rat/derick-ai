import React from 'react'

export default function YearInReview({
  transactions = [],
  year = new Date().getFullYear(),
  years = [],
  onYearChange = () => {},
  onSelectMonth = () => {}
}) {
  const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  const months = Array.from({ length: 12 }, (_, i) => i)

  const rows = months.map((monthIndex) => {
    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() === monthIndex
    })

    const income = monthTx
      .filter((t) => t.transaction_type === 'income')
      .reduce((s, t) => s + (t.amount || 0), 0)

    const expenses = monthTx
      .filter((t) => t.transaction_type === 'expense')
      .reduce((s, t) => s + (t.amount || 0), 0)

    const saved = income - expenses
    const label = new Intl.DateTimeFormat(undefined, { month: 'long' }).format(new Date(year, monthIndex, 1))

    return {
      label,
      saved,
      monthIndex
    }
  })

  return (
    <section className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <h2>Year Breakdown</h2>
        <select value={year} onChange={(e) => onYearChange(Number(e.target.value))}>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div
        style={{
          marginTop: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: '12px'
        }}
      >
        {rows.map((row) => (
          <button
            key={row.monthIndex}
            onClick={() => onSelectMonth(row.monthIndex)}
            className="card"
            style={{
              padding: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '96px'
            }}
          >
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
              {row.label}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 600,
                color: row.saved >= 0 ? '#22c55e' : '#ef4444'
              }}
            >
              {formatter.format(row.saved)}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
