import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import MonthlyIncome from './components/MonthlyIncome'
import ExpenditureChart from './components/ExpenditureChart'
import TargetsChart from './components/TargetsChart'
import SimpleTargetsChart from './components/SimpleTargetsChart'
import SimpleBudgetChart from './components/SimpleBudgetChart'
import TransactionsDrawer from './components/TransactionsDrawer'
import ViewTransactionsDrawer from './components/ViewTransactionsDrawer'
import TargetsDrawer from './components/TargetsDrawer'
import ProjectedIncomeDrawer from './components/ProjectedIncomeDrawer'
import CategoriesDrawer from './components/CategoriesDrawer'
import AiAdvisorDrawer from './components/AiAdvisorDrawer'
import YearInReview from './components/YearInReview'
import appConfig from '../config.json'

// backend base URL (Vite env var: VITE_API_BASE). Defaults to localhost:5000
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [transactionsDrawerOpen, setTransactionsDrawerOpen] = useState(false)
  const [viewTransactionsOpen, setViewTransactionsOpen] = useState(false)
  const [targetsDrawerOpen, setTargetsDrawerOpen] = useState(false)
  const [categoriesDrawerOpen, setCategoriesDrawerOpen] = useState(false)
  const [advisorDrawerOpen, setAdvisorDrawerOpen] = useState(false)
  const [projectedIncomeDrawerOpen, setProjectedIncomeDrawerOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(() => {
    const stored = localStorage.getItem('selectedUserId')
    return stored ? Number(stored) : 1
  })
  const [loginUsername, setLoginUsername] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [currentUsername, setCurrentUsername] = useState(() => {
    return localStorage.getItem('currentUsername') || 'User'
  })
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [transactions, setTransactions] = useState([])
  const [txLoading, setTxLoading] = useState(false)
  const [txError, setTxError] = useState(null)
  const [targets, setTargets] = useState({
    // amounts in dollars (based on projected income default)
    'Housing': 1500,
    'Food': 600,
    'Utilities': 400,
    'Transport': 750,
    'Entertainment': 250,
    'Healthcare': 250,
    'Other': 250
  })
  const [projectedIncome, setProjectedIncome] = useState(5000)
  const [expenseCategories, setExpenseCategories] = useState([
    'Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other'
  ])
  const [needsCategories, setNeedsCategories] = useState(['Housing', 'Food', 'Utilities', 'Healthcare'])
  const [wantsCategories, setWantsCategories] = useState(['Transport', 'Entertainment', 'Other'])
  const [savingsCategories, setSavingsCategories] = useState([])
  const [simpleView, setSimpleView] = useState(false)
  const [activePage, setActivePage] = useState('overview')
  const [reviewYear, setReviewYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function ensureConfiguredUser() {
      const storedUserId = localStorage.getItem('selectedUserId')
      if (storedUserId) return
      const cfgUser = appConfig && appConfig.user
      if (!cfgUser) return

      try {
        const res = await fetch(`${API_BASE}/api/users`)
        if (res.ok) {
          const users = await res.json()
          const match = users.find(u => u.username === cfgUser.username || u.email === cfgUser.email)
          if (match) {
            setSelectedUserId(match.id)
            setCurrentUsername(match.username || 'User')
            return
          }
        }

        // create user if not found
        const createRes = await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cfgUser.username, email: cfgUser.email })
        })
        if (createRes.ok) {
          const created = await createRes.json()
          if (created && created.id) {
            setSelectedUserId(created.id)
            setCurrentUsername(created.username || 'User')
          }
        }
      } catch (err) {
        console.error('Error ensuring configured user:', err)
      }
    }

    ensureConfiguredUser()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      localStorage.setItem('selectedUserId', String(selectedUserId))
    }
    if (currentUsername) {
      localStorage.setItem('currentUsername', currentUsername)
    }
  }, [selectedUserId, currentUsername])

  async function handleLogin() {
    const username = loginUsername.trim()
    if (!username) return
    setLoginLoading(true)
    setLoginError('')

    try {
      const res = await fetch(`${API_BASE}/api/users`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const users = await res.json()
      const match = users.find(u => u.username === username)
      if (match) {
        setSelectedUserId(match.id)
        setCurrentUsername(match.username || 'User')
        setActivePage('overview')
        return
      }

      const email = `${username}_${Date.now()}@example.com`
      const createRes = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      })
      if (!createRes.ok) throw new Error(`HTTP ${createRes.status}`)
      const created = await createRes.json()
      if (created && created.id) {
        setSelectedUserId(created.id)
        setCurrentUsername(created.username || 'User')
        setActivePage('overview')
      }
    } catch (err) {
      setLoginError('Unable to sign in right now.')
    } finally {
      setLoginLoading(false)
    }
  }

  useEffect(() => {
    async function loadCurrentUser() {
      if (!selectedUserId) return
      try {
        const res = await fetch(`${API_BASE}/api/users`)
        if (!res.ok) return
        const users = await res.json()
        const match = users.find(u => u.id === selectedUserId)
        if (match?.username) setCurrentUsername(match.username)
      } catch (err) {
        console.error('Failed to load current user:', err)
      }
    }

    loadCurrentUser()
  }, [selectedUserId])

  useEffect(() => {
    async function loadCategories() {
      if (!selectedUserId) return
      try {
        const res = await fetch(`${API_BASE}/api/users/${selectedUserId}/categories`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.categories) && data.categories.length) {
          setExpenseCategories(data.categories)
        }
        if (Array.isArray(data.needs_categories)) setNeedsCategories(data.needs_categories)
        if (Array.isArray(data.wants_categories)) setWantsCategories(data.wants_categories)
        if (Array.isArray(data.savings_categories)) setSavingsCategories(data.savings_categories)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    loadCategories()
  }, [selectedUserId])

  function handleAddTransaction(data){
    // if backend returned created transaction object, append to state
    console.log('New transaction', data)
    if (data && data.id) {
      setTransactions(prev => [...prev, data])
    }
  }

  function handleDeleteTransaction(transactionId) {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  useEffect(() => {
    async function loadTransactions() {
      if (!selectedUserId) return
      setTxLoading(true)
      setTxError(null)
      try {
        const res = await fetch(`${API_BASE}/api/users/${selectedUserId}/transactions`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load transactions:', err)
        setTxError(err.message)
      } finally {
        setTxLoading(false)
      }
    }

    loadTransactions()
  }, [selectedUserId])

  // compute monthly totals
  const monthTx = transactions.filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === selectedMonth.getFullYear() && d.getMonth() === selectedMonth.getMonth()
  })
  const monthlyIncome = monthTx
    .filter(t => t.transaction_type === 'income')
    .reduce((s, t) => s + (t.amount || 0), 0)
  const EXPENSE_CATS = expenseCategories && expenseCategories.length
    ? expenseCategories
    : ['Housing', 'Food', 'Utilities', 'Transport', 'Entertainment', 'Healthcare', 'Other']
  const expensesByCategory = {}
  EXPENSE_CATS.forEach(cat => { expensesByCategory[cat] = 0 })
  monthTx
    .filter(t => t.transaction_type === 'expense')
    .forEach(e => {
      const key = e.category && EXPENSE_CATS.includes(e.category) ? e.category : 'Other'
      expensesByCategory[key] += Number(e.amount) || 0
    })

  const topExpenses = monthTx
    .filter(t => t.transaction_type === 'expense')
    .slice()
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3)

  const topTransactions = monthTx
    .slice()
    .sort((a, b) => (Math.abs(b.amount || 0) - Math.abs(a.amount || 0)))
    .slice(0, 3)

  const topIncome = monthTx
    .filter(t => t.transaction_type === 'income')
    .slice()
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 3)

  const selectedYear = selectedMonth.getFullYear()
  const selectedMonthIndex = selectedMonth.getMonth()
  const currentYear = new Date().getFullYear()
  const reviewYears = Array.from(new Set([
    currentYear,
    ...transactions.map((t) => new Date(t.date).getFullYear()).filter((y) => Number.isFinite(y))
  ])).sort((a, b) => b - a)

  useEffect(() => {
    if (!reviewYears.includes(reviewYear) && reviewYears.length > 0) {
      setReviewYear(reviewYears[0])
    }
  }, [reviewYears, reviewYear])

  function updateMonthYear(monthIndex, year) {
    const next = new Date(selectedMonth)
    next.setFullYear(year)
    next.setMonth(monthIndex)
    setSelectedMonth(next)
  }

  return (
    <div className="app">
      <Header
        currentUsername={currentUsername}
        onOpenLogin={() => setActivePage('login')}
      />
      <main>
        <nav style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button
            className={`btn ${activePage === 'overview' ? 'btn-primary' : ''}`}
            onClick={() => setActivePage('overview')}
          >
            Overview
          </button>
          <button
            className={`btn ${activePage === 'year' ? 'btn-primary' : ''}`}
            onClick={() => setActivePage('year')}
          >
            Year Breakdown
          </button>
        </nav>

        {activePage === 'login' ? (
          <section className="card" style={{ maxWidth: '520px' }}>
            <h2>Sign in</h2>
            <p className="small">Enter your username to continue.</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username"
                aria-label="Username"
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLogin()
                }}
              />
              <button className="btn btn-primary" onClick={handleLogin} disabled={loginLoading || !loginUsername.trim()}>
                {loginLoading ? 'Signing in…' : 'Login'}
              </button>
            </div>
            {loginError ? <div className="small" style={{ color: '#ef4444', marginTop: '8px' }}>{loginError}</div> : null}
          </section>
        ) : activePage === 'overview' ? (
          <>
        <Dashboard
          topExpenses={topExpenses}
          topTransactions={topTransactions}
          topIncome={topIncome}
          selectedMonthIndex={selectedMonthIndex}
          selectedYear={selectedYear}
          onChangeMonth={(monthIndex) => updateMonthYear(monthIndex, selectedYear)}
          onChangeYear={(year) => updateMonthYear(selectedMonthIndex, year)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <MonthlyIncome
            month={selectedMonth}
            amount={monthlyIncome}
            projectedAmount={projectedIncome}
            onEditProjected={() => setProjectedIncomeDrawerOpen(true)}
          />
        </div>

        <section className="card" style={{ padding: '16px' }}>
          {/* View toggle */}
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <button
              className={`btn ${!simpleView ? 'btn-primary' : ''}`}
              onClick={() => setSimpleView(false)}
            >
              Detailed View
            </button>
            <button
              className={`btn ${simpleView ? 'btn-primary' : ''}`}
              onClick={() => setSimpleView(true)}
            >
              Simple View
            </button>
          </div>

          {/* Actual vs Target charts side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {simpleView ? (
            <SimpleBudgetChart
              income={monthlyIncome}
              expenses={expensesByCategory}
              needsCategories={needsCategories}
              wantsCategories={wantsCategories}
              savingsCategories={savingsCategories}
            />
          ) : (
            <ExpenditureChart
              onEditCategories={() => setCategoriesDrawerOpen(true)}
              needsCategories={needsCategories}
              wantsCategories={wantsCategories}
              savingsCategories={savingsCategories}
              data={(() => {
              const needsSet = new Set(needsCategories)
              const wantsSet = new Set(wantsCategories)
              const savingsSet = new Set(savingsCategories)
              const NEEDS_COLOR = '#3b82f6'
              const WANTS_COLOR = '#ef4444'
              const SAVINGS_COLOR = '#22c55e'
              const DEFAULT_COLOR = '#94a3b8'

              const getCategoryColor = (cat) => {
                if (savingsSet.has(cat)) return SAVINGS_COLOR
                if (needsSet.has(cat)) return NEEDS_COLOR
                if (wantsSet.has(cat)) return WANTS_COLOR
                return DEFAULT_COLOR
              }

              // total expenses and saved amount
              const totalExpenses = Object.values(expensesByCategory).reduce((s, a) => s + a, 0)
              const saved = Math.max(0, monthlyIncome - totalExpenses)

              // build chart data with percentages based on income
              const divisor = monthlyIncome > 0 ? monthlyIncome : 1
              const result = EXPENSE_CATS.map((cat) => ({
                label: cat,
                amount: expensesByCategory[cat],
                percentage: ((expensesByCategory[cat] / divisor) * 100).toFixed(1),
                color: getCategoryColor(cat)
              }))

              // add saved row
              result.push({
                label: 'Saved',
                amount: saved,
                percentage: ((saved / divisor) * 100).toFixed(1),
                color: SAVINGS_COLOR
              })

              return result
            })()}
            />
          )}

          {simpleView ? (
            <SimpleTargetsChart
              targets={targets}
              projectedIncome={projectedIncome}
              needsCategories={needsCategories}
              wantsCategories={wantsCategories}
              savingsCategories={savingsCategories}
              onEditClick={() => setTargetsDrawerOpen(true)}
            />
          ) : (
            <TargetsChart
              targets={targets}
              projectedIncome={projectedIncome}
              categories={EXPENSE_CATS}
              needsCategories={needsCategories}
              wantsCategories={wantsCategories}
              savingsCategories={savingsCategories}
              onEditClick={() => setTargetsDrawerOpen(true)}
            />
          )}
          </div>
        </section>

        <button
          className="btn btn-primary"
          style={{marginTop: 16, marginRight: 8}}
          onClick={() => setTransactionsDrawerOpen(true)}
        >
          Add Transaction
        </button>
        <button
          className="btn"
          style={{marginTop: 16}}
          onClick={() => setViewTransactionsOpen(true)}
        >
          View Transactions
        </button>
        <button
          className="btn"
          style={{marginTop: 16, marginLeft: 8}}
          onClick={() => setAdvisorDrawerOpen(true)}
        >
          Ask Budget Advisor
        </button>
          </>
        ) : (
          <YearInReview
            transactions={transactions}
            year={reviewYear}
            years={reviewYears}
            onYearChange={setReviewYear}
            onSelectMonth={(monthIndex) => {
              updateMonthYear(monthIndex, reviewYear)
              setActivePage('overview')
            }}
          />
        )}

      </main>
      <TransactionsDrawer
        open={transactionsDrawerOpen}
        onClose={() => setTransactionsDrawerOpen(false)}
        onSubmit={handleAddTransaction}
        userId={selectedUserId}
        expenseCategories={EXPENSE_CATS}
        savingsCategories={savingsCategories}
      />
      <ViewTransactionsDrawer
        open={viewTransactionsOpen}
        onClose={() => setViewTransactionsOpen(false)}
        userId={selectedUserId}
        month={selectedMonth}
        onDelete={handleDeleteTransaction}
      />
      <TargetsDrawer
        open={targetsDrawerOpen}
        onClose={() => setTargetsDrawerOpen(false)}
        targets={targets}
        projectedIncome={projectedIncome}
        categories={EXPENSE_CATS}
        onSave={(newTargets) => setTargets(newTargets)}
      />
      <CategoriesDrawer
        open={categoriesDrawerOpen}
        onClose={() => setCategoriesDrawerOpen(false)}
        needsCategories={needsCategories}
        wantsCategories={wantsCategories}
        savingsCategories={savingsCategories}
        onSave={async ({ needs_categories, wants_categories, savings_categories }) => {
          const union = Array.from(new Set([...(needs_categories || []), ...(wants_categories || []), ...(savings_categories || [])]))
          setExpenseCategories(union)
          setNeedsCategories(needs_categories || [])
          setWantsCategories(wants_categories || [])
          setSavingsCategories(savings_categories || [])

          // keep targets in sync with categories
          setTargets(prev => {
            const next = {}
            union.forEach(cat => { next[cat] = prev[cat] || 0 })
            return next
          })

          if (selectedUserId) {
            try {
              await fetch(`${API_BASE}/api/users/${selectedUserId}/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  needs_categories,
                  wants_categories,
                  savings_categories
                })
              })
            } catch (err) {
              console.error('Failed to save categories:', err)
            }
          }
        }}
      />
      <ProjectedIncomeDrawer
        open={projectedIncomeDrawerOpen}
        onClose={() => setProjectedIncomeDrawerOpen(false)}
        projectedIncome={projectedIncome}
        onSave={(value) => setProjectedIncome(value)}
      />
      <AiAdvisorDrawer
        open={advisorDrawerOpen}
        onClose={() => setAdvisorDrawerOpen(false)}
        projectedIncome={projectedIncome}
        currentMonthIncomeToDate={monthlyIncome}
        expensesByCategory={expensesByCategory}
        targets={targets}
      />
    </div>
  )
}
