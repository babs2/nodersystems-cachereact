import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import AccountInfo from './components/AccountInfo'
import DebtView from './components/DebtView'
import Login from './components/Login'
import HearingInfo from './components/HearingInfo'
import AWGBackground from './components/AWGBackground'
import './App.css'

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  // Hide navigation on the login screen
  if (location.pathname === '/login') {
    return null
  }

  function handleLogout() {
    try {
      localStorage.removeItem('accountId')
    } catch {
      // ignore storage errors
    }
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-logo">Debt Self-Service Portal</h1>
        <div className="nav-right">
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">Account Information</Link>
            </li>
            <li className="nav-item">
              <Link to="/debts" className="nav-link">My Debts</Link>
            </li>
          </ul>
          <button
            type="button"
            className="nav-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/hearing" element={<HearingInfo />} />
            <Route path="/awg-background" element={<AWGBackground />} />
            <Route path="/" element={<AccountInfo />} />
            <Route path="/debts" element={<DebtView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

