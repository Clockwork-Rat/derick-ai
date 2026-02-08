import React from 'react'

export default function SimpleBudgetChart({ income = 0, expenses = {}, needsCategories = [], wantsCategories = [], savingsCategories = [] }) {
  const needs = needsCategories.length ? needsCategories : ['Housing', 'Food', 'Utilities', 'Healthcare']
  const wants = wantsCategories.length ? wantsCategories : ['Entertainment', 'Transport', 'Other']
  const savingsCats = savingsCategories || []

  const expenses_needed = needs.reduce((s, cat) => s + (expenses[cat] || 0), 0)
  const expenses_wants = wants.reduce((s, cat) => s + (expenses[cat] || 0), 0)
  const expenses_savings = savingsCats.reduce((s, cat) => s + (expenses[cat] || 0), 0)
  const total_expenses = expenses_needed + expenses_wants + expenses_savings
  const savings = Math.max(0, income - total_expenses)

  const data = [
    { label: 'Needs', amount: expenses_needed, percentage: income > 0 ? ((expenses_needed / income) * 100).toFixed(1) : 0, color: '#ef4444' },
    { label: 'Wants', amount: expenses_wants, percentage: income > 0 ? ((expenses_wants / income) * 100).toFixed(1) : 0, color: '#f59e0b' },
    { label: 'Savings', amount: expenses_savings + savings, percentage: income > 0 ? (((expenses_savings + savings) / income) * 100).toFixed(1) : 0, color: '#22c55e' }
  ]

  return (
    <section className="card expenditure-chart">
      <h2>Budget Overview</h2>
      <div className="chart-list">
        {data.map((d, i) => (
          <div className="chart-row" key={i}>
            <div className="chart-meta">
              <div className="chart-label">{d.label}</div>
              <div className="chart-value">
                ${d.amount.toFixed(2)} ({d.percentage}%)
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
    </section>
  )
}
