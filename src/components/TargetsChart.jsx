import React from 'react'

export default function TargetsChart({ targets = {}, projectedIncome = 0, onEditClick = () => {}, categories = [], needsCategories = [], wantsCategories = [], savingsCategories = [] }) {
  const fallback = ['Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  const EXPENSE_CATS = categories.length ? categories : fallback
  const needsSet = new Set(needsCategories)
  const wantsSet = new Set(wantsCategories)
  const savingsSet = new Set(savingsCategories)
  const NEEDS_COLOR = '#93c5fd'
  const WANTS_COLOR = '#fca5a5'
  const SAVINGS_COLOR = '#86efac'
  const DEFAULT_COLOR = '#cbd5e1'

  const getCategoryColor = (cat) => {
    if (savingsSet.has(cat)) return SAVINGS_COLOR
    if (needsSet.has(cat)) return NEEDS_COLOR
    if (wantsSet.has(cat)) return WANTS_COLOR
    return DEFAULT_COLOR
  }

  const wantsWithoutOther = wantsCategories.filter((cat) => cat !== 'Other')
  const wantsOrdered = [...wantsWithoutOther]
  if (wantsCategories.includes('Other') || EXPENSE_CATS.includes('Other')) wantsOrdered.push('Other')

  const orderedCats = []
  const used = new Set()
  const pushIfAvailable = (cat) => {
    if (!EXPENSE_CATS.includes(cat) || used.has(cat)) return
    orderedCats.push(cat)
    used.add(cat)
  }

  needsCategories.forEach(pushIfAvailable)
  wantsOrdered.forEach(pushIfAvailable)
  savingsCategories.forEach(pushIfAvailable)
  EXPENSE_CATS.forEach(pushIfAvailable)

  const data = orderedCats.map((cat) => {
    const amount = targets[cat] || 0
    return {
      label: cat,
      amount: amount,
      color: getCategoryColor(cat)
    }
  })

  // Add saved row
  const allocatedAmount = Object.values(targets).reduce((s, v) => s + (v || 0), 0)
  const savedAmount = Math.max(0, projectedIncome - allocatedAmount)
  data.push({
    label: 'Saved',
    amount: savedAmount,
    color: SAVINGS_COLOR
  })

  // Calculate max for scaling
  const maxAmount = Math.max(...data.map(d => d.amount || 0))

  return (
    <section className="card expenditure-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', marginBottom: '4px' }}>
        <h2>Target Budget</h2>
        <button className="btn" onClick={onEditClick} style={{ padding: '6px 12px' }}>
          Edit
        </button>
      </div>

      <div className="chart-list">
        {data.map((d, i) => {
          const pct = projectedIncome > 0 ? ((d.amount / projectedIncome) * 100).toFixed(1) : 0
          const barWidth = maxAmount > 0 ? Math.round((d.amount / maxAmount) * 100) : 0
          return (
            <div className="chart-row" key={i}>
              <div className="chart-meta">
                <div className="chart-label">{d.label}</div>
                <div className="chart-value">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(d.amount)}
                </div>
              </div>
              <div className="chart-bar-wrap">
                <div
                  className="chart-bar"
                  style={{ width: `${barWidth}%`, background: d.color }}
                />
                <div className="chart-pct">{pct}%</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '12px', opacity: 0.6 }}>
        Total target: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(allocatedAmount + savedAmount)}
      </div>
    </section>
  )
}
