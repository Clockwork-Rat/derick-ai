import React from 'react'

export default function Header({ onAddCashflow }){
  return (
    <header>
      <h1>Budget App</h1>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <div className="small">v0.1.0</div>
      </div>
    </header>
  )
}
