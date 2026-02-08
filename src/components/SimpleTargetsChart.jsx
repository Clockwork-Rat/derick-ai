import React from 'react'

export default function SimpleTargetsChart({ targets = {}, projectedIncome = 0, onEditClick = () => {}, needsCategories = [], wantsCategories = [], savingsCategories = [] }) {
  const needs = needsCategories.length ? needsCategories : ['Housing', 'Food', 'Utilities', 'Healthcare']
  const wants = wantsCategories.length ? wantsCategories : ['Transport', 'Entertainment', 'Other']
  const savingsCats = savingsCategories || []

  const needs_amount = needs.reduce((s, cat) => s + (targets[cat] || 0), 0)
  const wants_amount = wants.reduce((s, cat) => s + (targets[cat] || 0), 0)
  const savings_amount = savingsCats.reduce((s, cat) => s + (targets[cat] || 0), 0)
  const allocatedAmount = needs_amount + wants_amount + savings_amount
  const savedAmount = Math.max(0, projectedIncome - allocatedAmount) + savings_amount

  const data = [
    { label: 'Needs', amount: needs_amount, percentage: projectedIncome > 0 ? (needs_amount / projectedIncome) * 100 : 0, color: '#93c5fd' },
    { label: 'Wants', amount: wants_amount, percentage: projectedIncome > 0 ? (wants_amount / projectedIncome) * 100 : 0, color: '#fca5a5' },
    { label: 'Savings', amount: savedAmount, percentage: projectedIncome > 0 ? (savedAmount / projectedIncome) * 100 : 0, color: '#86efac' }
  ]

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
                style={{ width: `${d.percentage}%`, background: d.color }}
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
