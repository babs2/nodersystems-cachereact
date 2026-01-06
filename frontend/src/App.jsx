import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import AccountInfo from './components/AccountInfo'
import DebtView from './components/DebtView'
import Login from './components/Login'
import HearingInfo from './components/HearingInfo'
import AWGBackground from './components/AWGBackground'
import GovernmentBanner from './components/GovernmentBanner'
import FloatingTranslate from './components/FloatingTranslate'
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
        <GovernmentBanner />
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
        <FloatingTranslate />
        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-column">
              <h4>The General Public</h4>
              <ul>
                <li><a href="https://www.fiscal.treasury.gov/public" target="_blank" rel="noreferrer">Services for the Public</a></li>
                <li><a href="https://www.pay.gov" target="_blank" rel="noreferrer">Pay.gov</a></li>
                <li><a href="https://www.treasurydirect.gov" target="_blank" rel="noreferrer">TreasuryDirect.gov</a></li>
                <li><a href="https://www.usa.gov" target="_blank" rel="noreferrer">USA.gov</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Government Agencies</h4>
              <ul>
                <li><a href="https://www.fiscal.treasury.gov/services/gov" target="_blank" rel="noreferrer">Services for Government Agencies</a></li>
                <li><a href="https://www.fiscal.treasury.gov/cross-servicing/" target="_blank" rel="noreferrer">Cross-Servicing (Debt Collection)</a></li>
                <li><a href="https://www.fiscal.treasury.gov/reference-guidance/" target="_blank" rel="noreferrer">Reference &amp; Guidance</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Business &amp; Institutions</h4>
              <ul>
                <li><a href="https://www.fiscal.treasury.gov/business" target="_blank" rel="noreferrer">Services for Business &amp; Institutions</a></li>
                <li><a href="https://www.eftps.gov" target="_blank" rel="noreferrer">EFTPS.gov</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>About Fiscal Service</h4>
              <ul>
                <li><a href="https://www.fiscal.treasury.gov/about" target="_blank" rel="noreferrer">About the Fiscal Service</a></li>
                <li><a href="https://www.fiscal.treasury.gov/news" target="_blank" rel="noreferrer">News</a></li>
                <li><a href="https://www.fiscal.treasury.gov/reports" target="_blank" rel="noreferrer">Reports</a></li>
                <li><a href="https://www.fiscal.treasury.gov/forms" target="_blank" rel="noreferrer">Forms</a></li>
                <li><a href="https://www.fiscal.treasury.gov/training" target="_blank" rel="noreferrer">Training</a></li>
                <li><a href="https://www.usajobs.gov" target="_blank" rel="noreferrer">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <p>Bureau of the Fiscal Service, U.S. Department of the Treasury</p>
              <p className="footer-small">English is the official and authoritative version of all federal information.</p>
            </div>
            <div className="footer-bottom-links">
              <a href="https://www.fiscal.treasury.gov/accessibility.html" target="_blank" rel="noreferrer">Accessibility Statement</a>
              <a href="https://www.fiscal.treasury.gov/privacy-policy.html" target="_blank" rel="noreferrer">Privacy Policy</a>
              <a href="https://www.fiscal.treasury.gov/foia.html" target="_blank" rel="noreferrer">Freedom of Information Act</a>
              <a href="https://www.paymentaccuracy.gov" target="_blank" rel="noreferrer">PaymentAccuracy.gov</a>
              <a href="https://www.fiscal.treasury.gov/data-quality.html" target="_blank" rel="noreferrer">Data Quality</a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App

