import React, { useEffect, useState } from 'react'

export default function ProjectedIncomeDrawer({ open = false, onClose = () => {}, projectedIncome = 0, onSave = () => {} }) {
  const [value, setValue] = useState(String(projectedIncome || 0))

  useEffect(() => {
    if (open) {
      setValue(String(projectedIncome || 0))
    }
  }, [open, projectedIncome])

  if (!open) return null

  function handleSave() {
    const parsed = parseFloat(String(value).replace(/[^0-9.-]+/g, ''))
    if (!Number.isFinite(parsed)) return
    onSave(parsed)
    onClose()
  }

  return (
    <div className="drawer-overlay" role="dialog" aria-modal="true">
      <div className="drawer">
        <div className="drawer-header">
          <h3>Edit Projected Income</h3>
          <button className="btn" onClick={onClose} aria-label="Close drawer">Close</button>
        </div>
        <div style={{ padding: '12px' }}>
          <label className="form-row" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>Projected Monthly Income</div>
            <input
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
            />
          </label>

          <div className="drawer-footer" style={{ marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
