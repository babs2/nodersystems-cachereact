import React, { useState, useEffect } from 'react'
import './AccountInfo.css'

function AccountInfo() {
  const [accountData, setAccountData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accountId, setAccountId] = useState('')
  const [editData, setEditData] = useState(null)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [savingTaxId, setSavingTaxId] = useState(false)
  const [showTaxpayerId, setShowTaxpayerId] = useState(false)

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
    // The backend in turn talks to InterSystems Caché and returns JSON.
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
        setEditData(data)
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

  function handleFieldChange(field, value) {
    setEditData(function(prev) {
      return {
        ...prev,
        [field]: value
      }
    })
  }

  function savePartial(updates, setSavingFlag) {
    if (!accountData || !editData) return

    const id = accountData.accountNumber || accountId
    if (!id) return

    setSavingFlag(true)
    setError(null)

    fetch(`/api/account/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Failed to save account changes')
        }
        return response.json()
      })
      .then(function(updated) {
        setAccountData(updated)
        setEditData(updated)
        setSavingFlag(false)
      })
      .catch(function(err) {
        setError(err.message)
        setSavingFlag(false)
      })
  }

  function handleSaveEmail() {
    savePartial({ email: editData.email || '' }, setSavingEmail)
  }

  function handleSavePhone() {
    savePartial({ phone: editData.phone || '' }, setSavingPhone)
  }

  function handleSaveAddress() {
    savePartial({
      address1: editData.address1 || '',
      address2: editData.address2 || '',
      city: editData.city || '',
      state: editData.state || '',
      zipCode: editData.zipCode || ''
    }, setSavingAddress)
  }

  function handleSaveTaxId() {
    savePartial({ taxpayerId: editData.taxpayerId || '' }, setSavingTaxId)
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
                  <span className="detail-label">Account Holder:</span>
                  <span className="detail-value">{accountData.accountHolder || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status ${accountData.status?.toLowerCase() || 'unknown'}`}>
                    {accountData.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section contact-section">
              <div className="info-groups">
                <div className="info-group">
                  <div className="info-group-header">
                    <h4>Contact email</h4>
                  </div>
                  <div className="info-group-body">
                    <label className="detail-label" htmlFor="email-input">
                      Email
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      className="detail-input"
                      value={editData?.email || ''}
                      onChange={function(e) {
                        handleFieldChange('email', e.target.value)
                      }}
                      placeholder="Email address"
                    />
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={handleSaveEmail}
                      disabled={savingEmail}
                    >
                      {savingEmail ? 'Saving…' : 'Update email'}
                    </button>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-group-header">
                    <h4>Mailing address</h4>
                  </div>
                  <div className="info-group-body">
                    <label className="detail-label" htmlFor="address1-input">
                      Address
                    </label>
                    <input
                      id="address1-input"
                      type="text"
                      className="detail-input"
                      value={editData?.address1 || ''}
                      onChange={function(e) {
                        handleFieldChange('address1', e.target.value)
                      }}
                      placeholder="Street address line 1"
                    />
                    <input
                      type="text"
                      className="detail-input"
                      value={editData?.address2 || ''}
                      onChange={function(e) {
                        handleFieldChange('address2', e.target.value)
                      }}
                      placeholder="Street address line 2 (optional)"
                    />
                    <div className="address-row">
                      <input
                        type="text"
                        className="detail-input"
                        value={editData?.city || ''}
                        onChange={function(e) {
                          handleFieldChange('city', e.target.value)
                        }}
                        placeholder="City"
                      />
                      <input
                        type="text"
                        className="detail-input"
                        value={editData?.state || ''}
                        onChange={function(e) {
                          handleFieldChange('state', e.target.value)
                        }}
                        placeholder="State"
                      />
                      <input
                        type="text"
                        className="detail-input"
                        value={editData?.zipCode || ''}
                        onChange={function(e) {
                          handleFieldChange('zipCode', e.target.value)
                        }}
                        placeholder="ZIP code"
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={handleSaveAddress}
                      disabled={savingAddress}
                    >
                      {savingAddress ? 'Saving…' : 'Update address'}
                    </button>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-group-header">
                    <h4>Phone</h4>
                  </div>
                  <div className="info-group-body">
                    <label className="detail-label" htmlFor="phone-input">
                      Phone
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      className="detail-input"
                      value={editData?.phone || ''}
                      onChange={function(e) {
                        handleFieldChange('phone', e.target.value)
                      }}
                      placeholder="Phone number"
                    />
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                    >
                      {savingPhone ? 'Saving…' : 'Update phone'}
                    </button>
                  </div>
                </div>

                <div className="info-group">
                  <div className="info-group-header">
                    <h4>Taxpayer ID</h4>
                  </div>
                  <div className="info-group-body">
                    <label className="detail-label" htmlFor="taxpayer-input">
                      Taxpayer ID (SSN or EIN)
                    </label>
                    <div className="taxpayer-row">
                      <input
                        id="taxpayer-input"
                        type={showTaxpayerId ? 'text' : 'password'}
                        className="detail-input"
                        value={editData?.taxpayerId || ''}
                        onChange={function(e) {
                          handleFieldChange('taxpayerId', e.target.value)
                        }}
                        placeholder="Taxpayer ID"
                      />
                      <button
                        type="button"
                        className="peek-button"
                        onClick={function() {
                          setShowTaxpayerId(function(prev) {
                            return !prev
                          })
                        }}
                      >
                        {showTaxpayerId ? 'Hide' : 'Peek'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={handleSaveTaxId}
                      disabled={savingTaxId}
                    >
                      {savingTaxId ? 'Saving…' : 'Update taxpayer ID'}
                    </button>
                  </div>
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
                  <button
                    type="button"
                    className="btn-primary balance-pay-button"
                    onClick={function() {
                      window.open('https://www.pay.gov/public/form/entry/101/16531440/', '_blank', 'noopener')
                    }}
                  >
                    Pay now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountInfo

