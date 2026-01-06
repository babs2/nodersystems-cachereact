import React from 'react'
import './Login.css'

function Login() {
  function handleContinue() {
    // Simple login placeholder – just navigate to the main account page.
    window.location.href = '/'
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Debt Self-Service Portal</h1>
        <p className="login-subtitle">
          Securely view your account information and manage your debts.
        </p>
        <button
          type="button"
          className="btn-primary login-button"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default Login

