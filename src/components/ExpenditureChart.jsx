import React from 'react'

export default function ExpenditureChart({ data = [], onEditCategories = () => {}, needsCategories = [], wantsCategories = [], savingsCategories = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Expenditure Breakdown</h2>
          <button className="btn" onClick={onEditCategories}>Edit Categories</button>
        </div>
        <p className="small">No data available</p>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + (d.amount || 0), 0)
  const max = Math.max(...data.map(d => d.amount || 0))
  const needsSet = new Set(needsCategories)
  const wantsSet = new Set(wantsCategories)
  const savingsSet = new Set(savingsCategories)
  const NEEDS_COLOR = '#93c5fd'
  const WANTS_COLOR = '#fca5a5'
  const SAVINGS_COLOR = '#86efac'

  const getCategoryColor = (cat) => {
    if (cat === 'Saved') return SAVINGS_COLOR
    if (savingsSet.has(cat)) return SAVINGS_COLOR
    if (needsSet.has(cat)) return NEEDS_COLOR
    if (wantsSet.has(cat)) return WANTS_COLOR
    return null
  }

  const baseData = data.filter((d) => d.label !== 'Saved')
  const savedRow = data.find((d) => d.label === 'Saved')
  const dataByLabel = new Map(baseData.map((d) => [d.label, d]))
  const orderedLabels = []
  const used = new Set()

  const pushIfAvailable = (label) => {
    if (!dataByLabel.has(label) || used.has(label)) return
    orderedLabels.push(label)
    used.add(label)
  }

  const wantsWithoutOther = wantsCategories.filter((cat) => cat !== 'Other')
  const wantsOrdered = [...wantsWithoutOther]
  if (wantsCategories.includes('Other') || dataByLabel.has('Other')) wantsOrdered.push('Other')

  needsCategories.forEach(pushIfAvailable)
  wantsOrdered.forEach(pushIfAvailable)
  savingsCategories.forEach(pushIfAvailable)
  baseData.forEach((d) => pushIfAvailable(d.label))

  const orderedData = orderedLabels.map((label) => dataByLabel.get(label)).filter(Boolean)
  if (savedRow) orderedData.push(savedRow)

  return (
    <section className="card expenditure-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', marginBottom: '4px' }}>
        <h2>Expenditure Breakdown</h2>
        <button className="btn" onClick={onEditCategories}>Edit Categories</button>
      </div>
      <div className="chart-list">
        {orderedData.map((d, i) => {
          const pct = total ? ((d.amount / total) * 100).toFixed(1) : 0
          const barWidth = max ? Math.round((d.amount / max) * 100) : 0
          const mappedColor = getCategoryColor(d.label)
          const barColor = mappedColor || d.color || 'var(--accent)'
          return (
            <div className="chart-row" key={i}>
              <div className="chart-meta">
                <div className="chart-label">{d.label}</div>
                <div className="chart-value">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(d.amount)}</div>
              </div>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ width: `${barWidth}%`, background: barColor }} />
                <div className="chart-pct">{d.percentage || pct}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
