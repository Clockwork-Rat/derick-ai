import React from 'react'

export default function YearInReview({
  transactions = [],
  year = new Date().getFullYear(),
  years = [],
  onYearChange = () => {}
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
      saved
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
      <div className="chart-list" style={{ marginTop: '8px' }}>
        {rows.map((row, i) => (
          <div className="chart-row" key={i}>
            <div className="chart-meta">
              <div className="chart-label">{row.label}</div>
              <div
                className="chart-value"
                style={{ color: row.saved >= 0 ? '#22c55e' : '#ef4444' }}
              >
                {formatter.format(row.saved)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
