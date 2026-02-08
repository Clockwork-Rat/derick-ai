import React, { useEffect, useState } from 'react'

export default function CategoriesDrawer({
  open = false,
  onClose = () => {},
  needsCategories = [],
  wantsCategories = [],
  savingsCategories = [],
  onSave = () => {}
}) {
  const [needs, setNeeds] = useState([])
  const [wants, setWants] = useState([])
  const [savings, setSavings] = useState([])

  useEffect(() => {
    if (open) {
      const n = Array.isArray(needsCategories) ? needsCategories.slice() : []
      const w = Array.isArray(wantsCategories) ? wantsCategories.slice() : []
      const s = Array.isArray(savingsCategories) ? savingsCategories.slice() : []
      if (!w.includes('Other')) w.push('Other')

      const wantsOrdered = [...w.filter((val) => val !== 'Other'), 'Other']

      setNeeds(n.map((val) => ({ id: crypto.randomUUID(), value: val })))
      setWants(wantsOrdered.map((val) => ({ id: crypto.randomUUID(), value: val })))
      setSavings(s.map((val) => ({ id: crypto.randomUUID(), value: val })))
    }
  }, [open, needsCategories, wantsCategories, savingsCategories])

  if (!open) return null

  function updateList(setter, id, value) {
    setter(prev => prev.map((v) => (v.id === id ? { ...v, value } : v)))
  }

  function addToList(setter) {
    setter(prev => [...prev, { id: crypto.randomUUID(), value: '' }])
  }

  function addWant() {
    setWants(prev => {
      const otherIndex = prev.findIndex((item) => item.value === 'Other')
      const nextItem = { id: crypto.randomUUID(), value: '' }
      if (otherIndex === -1) return [...prev, nextItem]
      return [...prev.slice(0, otherIndex), nextItem, ...prev.slice(otherIndex)]
    })
  }

  function removeFromList(list, setter, id) {
    const item = list.find((x) => x.id === id)
    if (item?.value === 'Other') return
    setter(prev => prev.filter((x) => x.id !== id))
  }

  function clean(list) {
    return list
      .map(v => String(v?.value || '').trim())
      .filter(v => v.length > 0)
  }

  function handleSave() {
    const cleanedNeeds = clean(needs)
    const cleanedWants = clean(wants)
    const cleanedSavings = clean(savings)
    if (!cleanedWants.includes('Other')) cleanedWants.push('Other')
    const wantsOrdered = [...cleanedWants.filter((val) => val !== 'Other'), 'Other']

    onSave({
      needs_categories: cleanedNeeds,
      wants_categories: wantsOrdered,
      savings_categories: cleanedSavings
    })
    onClose()
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Edit Expense Categories</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>
        <div style={{ padding: '12px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <h4>Needs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {needs.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateList(setNeeds, item.id, e.target.value)}
                      placeholder="Category name"
                    />
                    <button className="btn" onClick={() => removeFromList(needs, setNeeds, item.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <button className="btn" onClick={() => addToList(setNeeds)}>Add Need</button>
              </div>
            </div>

            <div>
              <h4>Wants</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {wants.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={item.value}
                      disabled={item.value === 'Other'}
                      onChange={(e) => updateList(setWants, item.id, e.target.value)}
                      placeholder="Category name"
                    />
                    <button className="btn" onClick={() => removeFromList(wants, setWants, item.id)} disabled={item.value === 'Other'}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <button className="btn" onClick={addWant}>Add Want</button>
              </div>
            </div>

            <div>
              <h4>Savings</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savings.map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) => updateList(setSavings, item.id, e.target.value)}
                      placeholder="Category name"
                    />
                    <button className="btn" onClick={() => removeFromList(savings, setSavings, item.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <button className="btn" onClick={() => addToList(setSavings)}>Add Savings</button>
              </div>
            </div>
          </div>

          <div className="drawer-footer" style={{ marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleSave}>Save Categories</button>
          </div>
        </div>
      </div>
    </div>
  )
}
