import React from 'react'

export default function ExpenditureChart({ data = [], onEditCategories = () => {} }) {
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

  return (
    <section className="card expenditure-chart">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '36px', marginBottom: '4px' }}>
        <h2>Expenditure Breakdown</h2>
        <button className="btn" onClick={onEditCategories}>Edit Categories</button>
      </div>
      <div className="chart-list">
        {data.map((d, i) => {
          const pct = total ? ((d.amount / total) * 100).toFixed(1) : 0
          const barWidth = max ? Math.round((d.amount / max) * 100) : 0
          return (
            <div className="chart-row" key={i}>
              <div className="chart-meta">
                <div className="chart-label">{d.label}</div>
                <div className="chart-value">{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(d.amount)}</div>
              </div>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ width: `${barWidth}%`, background: d.color || 'var(--accent)' }} />
                <div className="chart-pct">{d.percentage || pct}%</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
