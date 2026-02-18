import React from 'react'

export default function Header({
  currentUsername = '',
  onOpenLogin = () => {},
  onLogout = () => {}
}){
  const isLoggedIn = currentUsername && currentUsername.trim() !== ''
  
  return (
    <header>
      <h1>Budget App</h1>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        {isLoggedIn ? (
          <>
            <span className="small">Welcome, {currentUsername}</span>
            <button className="btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onOpenLogin}>
            Login
          </button>
        )}
        <div className="small">v0.1.0</div>
      </div>
    </header>
  )
}
