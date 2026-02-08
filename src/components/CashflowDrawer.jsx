import React, { useState, useEffect } from 'react'

const INCOME_CATEGORIES = ['Wages', 'Interest', 'Dividends', 'Other']
const EXPENDITURE_CATEGORIES = ['Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Other']

export default function CashflowDrawer({ open = false, onClose = () => {}, onSubmit = () => {} }) {
  const [type, setType] = useState('expenditure')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    // reset defaults when opening
    if (open) {
      setType('expenditure')
      setCategory(EXPENDITURE_CATEGORIES[0])
      setAmount('')
      setDate(new Date().toISOString().slice(0,10))
      setDescription('')
    }
  }, [open])

  useEffect(() => {
    setCategory(type === 'income' ? INCOME_CATEGORIES[0] : EXPENDITURE_CATEGORIES[0])
  }, [type])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const parsed = parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0
    onSubmit({ type, category, amount: parsed, date, description })
    onClose()
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Add Cashflow</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>
        <form className="drawer-form" onSubmit={handleSubmit}>
          <label className="form-row">
            <div>Type</div>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expenditure">Expenditure</option>
            </select>
          </label>

          <label className="form-row">
            <div>Category</div>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {(type === 'income' ? INCOME_CATEGORIES : EXPENDITURE_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="form-row">
            <div>Amount</div>
            <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} required />
          </label>

          <label className="form-row">
            <div>Date</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>

          <label className="form-row">
            <div>Description</div>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
          </label>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
