import React, { useState, useEffect } from 'react'

// Use Vite env var or default to localhost backend
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function ViewTransactionsDrawer({
  open = false,
  onClose = () => {},
  userId = null,
  month = new Date(),
  onDelete: onDeleteCallback
}) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')

  useEffect(() => {
    if (open && userId) {
      setCategoryFilter('All')
      fetchTransactions()
    }
  }, [open, userId, month])

  async function fetchTransactions() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/transactions`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch transactions`)
      }

      const text = await response.text()
      if (!text) {
        setTransactions([])
        return
      }

      console.log('Raw response text:', text)
      let data = null
      try {
        data = JSON.parse(text)
      } catch (parseErr) {
        console.error('Failed to parse JSON from server:', parseErr)
        const snippet = text ? String(text).slice(0, 1000) : '<empty response>'
        setError(`Invalid JSON from server: ${snippet}`)
        return
      }

      // Filter transactions by month
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const filtered = Array.isArray(data) ? data.filter(t => {
        const transDate = new Date(t.date)
        return transDate >= monthStart && transDate <= monthEnd
      }) : []

      setTransactions(filtered)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteTransaction(transactionId) {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`${API_BASE}/api/transactions/${transactionId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete transaction')

      // Remove from local state
      setTransactions(transactions.filter(t => t.id !== transactionId))
      if (typeof onDeleteCallback === 'function') onDeleteCallback(transactionId)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!open) return null

  const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const categoryOptions = ['All', ...Array.from(new Set(transactions.map(t => t.category).filter(Boolean)))].sort((a, b) => {
    if (a === 'All') return -1
    if (b === 'All') return 1
    return a.localeCompare(b)
  })
  const visibleTransactions = categoryFilter === 'All'
    ? transactions
    : transactions.filter(t => t.category === categoryFilter)
  const income = visibleTransactions.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = visibleTransactions.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer" style={{width: '500px'}}>
        <div className="drawer-header">
          <div>
            <h3>Transactions - {monthName}</h3>
            {userId && <p style={{margin: '4px 0 0', fontSize: '14px', opacity: 0.7}}>User #{userId}</p>}
          </div>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>

        {error && (
          <div style={{padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', margin: '12px'}}>
            {error}
          </div>
        )}

        <div style={{padding: '12px', display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb', alignItems: 'center', flexWrap: 'wrap'}}>
          <div>
            <div style={{fontSize: '12px', opacity: 0.6}}>Income</div>
            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#10b981'}}>
              ${income.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{fontSize: '12px', opacity: 0.6}}>Expenses</div>
            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#ef4444'}}>
              ${expenses.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{fontSize: '12px', opacity: 0.6}}>Net</div>
            <div style={{fontSize: '18px', fontWeight: 'bold', color: income - expenses >= 0 ? '#10b981' : '#ef4444'}}>
              ${(income - expenses).toFixed(2)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', opacity: 0.6 }}>Category</div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{maxHeight: '400px', overflowY: 'auto', padding: '12px'}}>
          {loading ? (
            <div style={{textAlign: 'center', padding: '24px', opacity: 0.6}}>Loading...</div>
          ) : visibleTransactions.length === 0 ? (
            <div style={{textAlign: 'center', padding: '24px', opacity: 0.6}}>No transactions this month</div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {visibleTransactions.map(transaction => (
                <div
                  key={transaction.id}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 'bold'}}>{transaction.description}</div>
                    <div style={{fontSize: '12px', opacity: 0.6}}>
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: transaction.transaction_type === 'income' ? '#10b981' : '#ef4444',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
