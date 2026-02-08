import React from 'react'

export default function Header({
  currentUsername = 'User',
  onOpenLogin = () => {}
}){
  return (
    <header>
      <h1>Budget App</h1>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <button className="btn btn-primary" onClick={onOpenLogin}>
          {currentUsername}
        </button>
        <div className="small">v0.1.0</div>
      </div>
    </header>
  )
}
