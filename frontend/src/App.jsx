import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AccountInfo from './components/AccountInfo'
import DebtView from './components/DebtView'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">Debt Self-Service Portal</h1>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Account Information</Link>
              </li>
              <li className="nav-item">
                <Link to="/debts" className="nav-link">My Debts</Link>
              </li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<AccountInfo />} />
            <Route path="/debts" element={<DebtView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

