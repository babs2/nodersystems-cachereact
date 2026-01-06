import React, { useState, useEffect } from 'react'
import './AccountInfo.css'

function AccountInfo() {
  const [accountData, setAccountData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accountId, setAccountId] = useState('')

  useEffect(function() {
    // Load account ID from localStorage if available
    const savedAccountId = localStorage.getItem('accountId')
    if (savedAccountId) {
      setAccountId(savedAccountId)
      fetchAccountInfo(savedAccountId)
    } else {
      setLoading(false)
    }
  }, [])

  function fetchAccountInfo(id) {
    if (!id) {
      setError('Please enter an account ID')
      return
    }

    setLoading(true)
    setError(null)

    // This calls your backend API route at GET /api/account/:accountId
    // The backend in turn talks to InterSystems IRIS / Caché and returns JSON.
    // Example of JSON coming back from the API:
    // {
    //   "accountNumber": "12345",
    //   "accountHolder": "John Doe",
    //   "status": "Active",
    //   "email": "john@example.com",
    //   "phone": "555‑1234",
    //   "currentBalance": 1250.50   // <-- balance from Cache
    // }
    //
    // Whatever value the backend puts into currentBalance will be rendered
    // into the "Current Balance" card below.
    fetch(`/api/account/${id}`)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to fetch account information')
        }
        return response.json()
      })
      .then(function(data) {
        setAccountData(data)
        localStorage.setItem('accountId', id)
        setLoading(false)
      })
      .catch(function(err) {
        setError(err.message)
        setLoading(false)
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetchAccountInfo(accountId)
  }

  if (loading && !accountData) {
    return (
      <div className="account-info-container">
        <div className="card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="account-info-container">
      <div className="card">
        <h2>Account Information</h2>
        
        {!accountData && (
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label htmlFor="accountId">Account ID</label>
              <input
                type="text"
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your account ID"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Load Account
            </button>
          </form>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {accountData && (
          <div className="account-details">
            <div className="detail-section">
              <h3>Account Overview</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Account Number:</span>
                  <span className="detail-value">{accountData.accountNumber || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Account Holder:</span>
                  <span className="detail-value">{accountData.accountHolder || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status ${accountData.status?.toLowerCase() || 'unknown'}`}>
                    {accountData.status || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{accountData.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{accountData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Balance Information</h3>
              <div className="balance-card">
                <div className="balance-item">
                  <span className="balance-label">Current Balance</span>
                  <span className="balance-value">
                    {/* This is where the balance from the API is inserted into the UI.
                        The backend must supply `currentBalance` in the response JSON,
                        and React will format and display it here. */}
                    ${accountData.currentBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setAccountData(null)
                setAccountId('')
                localStorage.removeItem('accountId')
              }} 
              className="btn-secondary"
            >
              Load Different Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountInfo

