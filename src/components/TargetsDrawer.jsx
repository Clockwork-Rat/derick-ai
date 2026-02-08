import React, { useState, useEffect } from 'react'

export default function TargetsDrawer({ open = false, onClose = () => {}, targets = {}, projectedIncome = 0, onSave = () => {}, categories = [] }) {
  const [targetValues, setTargetValues] = useState({})

  const fallback = ['Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  const EXPENSE_CATS = categories.length ? categories : fallback

  useEffect(() => {
    if (open) {
      // init from props or defaults
      const init = {}
      EXPENSE_CATS.forEach(cat => {
        init[cat] = targets[cat] || 0
      })
      setTargetValues(init)
    }
  }, [open, targets, categories])

  if (!open) return null

  function handleChange(category, value) {
    setTargetValues(prev => ({ ...prev, [category]: parseFloat(value) || 0 }))
  }

  function handleSave() {
    onSave(targetValues)
    onClose()
  }

  const total = Object.values(targetValues).reduce((s, v) => s + v, 0)

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Edit Budget Targets</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>

        <div style={{ padding: '12px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '14px', opacity: 0.7 }}>
            Set target percentages of income for each category
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {EXPENSE_CATS.map(cat => {
              const amount = targetValues[cat] || 0
              const pct = projectedIncome > 0 ? (amount / projectedIncome) * 100 : 0
              return (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: '100px' }}>{cat}</div>
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => handleChange(cat, e.target.value)}
                    style={{ width: '60px', padding: '4px' }}
                  />
                  <span style={{ width: '80px', textAlign: 'right', fontSize: '12px', opacity: 0.7 }}>
                    {pct.toFixed(1)}%
                  </span>
                </label>
              )
            })}
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '8px 12px', 
            backgroundColor: projectedIncome > 0 && total > projectedIncome ? '#fee2e2' : '#f0fdf4',
            color: projectedIncome > 0 && total > projectedIncome ? '#dc2626' : '#166534',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            Total: {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(total)}
            {projectedIncome > 0 && total > projectedIncome ? ' (exceeds projected income)' : ''}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              style={{ flex: 1 }}
            >
              Save Targets
            </button>
            <button 
              className="btn" 
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
