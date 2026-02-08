import React, { useState, useEffect } from 'react'

// call backend directly (Vite env var or default)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Bonus', 'Interest', 'Dividends', 'Other']
const DEFAULT_EXPENSE_CATEGORIES = ['Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other']

export default function TransactionsDrawer({
  open = false,
  onClose = () => {},
  onSubmit = () => {},
  userId = null,
  expenseCategories = DEFAULT_EXPENSE_CATEGORIES,
  savingsCategories = []
}) {
  const [transactionType, setTransactionType] = useState('expense')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    // reset defaults when opening
    if (open) {
      setTransactionType('expense')
      const list = expenseCategories.length ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES
      setCategory(list[0])
      setAmount('')
      setDate(new Date().toISOString().slice(0, 10))
      setDescription('')
    }
  }, [open])

  useEffect(() => {
    const expenseList = expenseCategories.length ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES
    const savingsList = savingsCategories.length ? savingsCategories : ['Savings']
    if (transactionType === 'income') setCategory(INCOME_CATEGORIES[0])
    else if (transactionType === 'savings') setCategory(savingsList[0])
    else setCategory(expenseList[0])
  }, [transactionType, expenseCategories, savingsCategories])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const parsed = parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0

    const payload = {
      user_id: userId,
      description,
      amount: parsed,
      transaction_type: transactionType === 'expense' ? 'expense' : 'income',
      category,
      date
    }

    // If userId not provided, call callback and close locally
    if (!userId) {
      onSubmit(payload)
      onClose()
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Server error ${res.status}: ${txt}`)
      }

      const created = await res.json()
      onSubmit(created)
      onClose()
    } catch (err) {
      console.error('Failed to create transaction:', err)
      setError(err.message || 'Failed to create transaction')
    }
  }

  const categories = transactionType === 'income'
    ? INCOME_CATEGORIES
    : transactionType === 'savings'
      ? (savingsCategories.length ? savingsCategories : ['Savings'])
      : (expenseCategories.length ? expenseCategories : DEFAULT_EXPENSE_CATEGORIES)

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Add Transaction</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>
        <form className="drawer-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{padding: '8px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 4, marginBottom: 8}}>
              {error}
            </div>
          )}
          <label className="form-row">
            <div>Type</div>
            <select value={transactionType} onChange={e => setTransactionType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings">Savings</option>
            </select>
          </label>

          <label className="form-row">
            <div>Category</div>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="form-row">
            <div>Amount</div>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>

          <label className="form-row">
            <div>Date</div>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              required
            />
          </label>

          <label className="form-row">
            <div>Description</div>
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Transaction description"
              required
            />
          </label>

          <div className="drawer-footer">
            <button type="submit" className="btn btn-primary">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}
