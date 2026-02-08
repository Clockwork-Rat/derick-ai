import React from 'react'

export default function TargetsChart({ targets = {}, projectedIncome = 0, onEditClick = () => {}, categories = [] }) {
  const fallback = ['Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  const EXPENSE_CATS = categories.length ? categories : fallback
  const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4']

  const data = EXPENSE_CATS.map((cat, i) => {
    const amount = targets[cat] || 0
    const pct = projectedIncome > 0 ? (amount / projectedIncome) * 100 : 0
    return {
      label: cat,
      percentage: pct,
      amount: amount,
      color: palette[i % palette.length]
    }
  })

  // Add saved percentage
  const allocatedAmount = Object.values(targets).reduce((s, v) => s + (v || 0), 0)
  const savedAmount = Math.max(0, projectedIncome - allocatedAmount)
  const saved = projectedIncome > 0 ? (savedAmount / projectedIncome) * 100 : 0
  data.push({
    label: 'Saved',
    percentage: saved,
    amount: savedAmount,
    color: '#22c55e'
  })

  return (
    <section className="card expenditure-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', marginBottom: '4px' }}>
        <h2>Target Budget</h2>
        <button className="btn" onClick={onEditClick} style={{ padding: '6px 12px' }}>
          Edit
        </button>
      </div>

      <div className="chart-list">
        {data.map((d, i) => (
          <div className="chart-row" key={i}>
            <div className="chart-meta">
              <div className="chart-label">{d.label}</div>
              <div className="chart-value">
                {d.percentage.toFixed(1)}% ({new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(d.amount)})
              </div>
            </div>
            <div className="chart-bar-wrap">
              <div 
                className="chart-bar" 
                style={{ width: `${(d.percentage / 100) * 100}%`, background: d.color }} 
              />
              <div className="chart-pct"></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '12px', opacity: 0.6 }}>
        Total allocated: {projectedIncome > 0 ? ((allocatedAmount / projectedIncome) * 100).toFixed(1) : '0.0'}%
      </div>
    </section>
  )
}
