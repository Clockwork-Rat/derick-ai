import React from 'react'

export default function MonthlyIncome({ amount = 0, projectedAmount = 0, month, onEditProjected = () => {} }) {
  const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
  const formattedProjected = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(projectedAmount)

  function formatMonth(m) {
    if (!m) return ''
    let date
    if (m instanceof Date) date = m
    else if (typeof m === 'number') date = new Date(new Date().getFullYear(), m - 1)
    else date = new Date(m)
    if (isNaN(date)) return String(m)
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date)
  }

  return (
    <div className="card monthly-income">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="mi-month">{formatMonth(month)}</div>
      </div>
      <div className="mi-amount">{formatted}</div>
      <div 
        style={{ 
          marginTop: '6px', 
          fontSize: '12px', 
          opacity: 0.7,
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted'
        }}
        onClick={onEditProjected}
        title="Click to edit projected income"
      >
        Projected: {formattedProjected}
      </div>
    </div>
  )
}
