import React, { useState, useEffect } from 'react'
import './DebtView.css'

function DebtView() {
  const [debts, setDebts] = useState([])
  const [accountData, setAccountData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [accountId, setAccountId] = useState('')
  const [totalDebt, setTotalDebt] = useState(0)
  const [openCard, setOpenCard] = useState(null)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [editData, setEditData] = useState(null)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const [savingTaxId, setSavingTaxId] = useState(false)
  const [showTaxpayerId, setShowTaxpayerId] = useState(false)

  useEffect(function() {
    const savedAccountId = localStorage.getItem('accountId')
    if (savedAccountId) {
      setAccountId(savedAccountId)
      loadAll(savedAccountId)
    } else {
      setLoading(false)
    }
  }, [])

  function loadAll(id) {
    if (!id) {
      setError('Please enter an account ID')
      return
    }

    setLoading(true)
    setError(null)

    // Both of these calls go to your backend, which is responsible for reading
    // from the InterSystems Caché database and shaping the JSON:
    //
    // - /api/account/:id  -> account info, including currentBalance
    // - /api/debts/:id    -> array of debts and totalDebt (sum of all amounts)
    //
    // Example of the debts JSON from the backend:
    // {
    //   "debts": [
    //     {
    //       "debtId": "DEBT001",
    //       "amount": 850.25,
    //       "dueDate": "2024-02-15",
    //       "status": "Pending",
    //       "dateIncurred": "2023-12-01",
    //       "datePlaced": "2024-01-05",
    //       "referringAgency": "Consumer Finance Bureau"
    //     }
    //   ],
    //   "totalDebt": 1250.50   // <-- total owed to Treasury, used in the summary bar
    // }
    Promise.all([
      fetch(`/api/account/${id}`).then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch account')
        return res.json()
      }),
      fetch(`/api/debts/${id}`).then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch debts')
        return res.json()
      })
    ])
      .then(function(results) {
        const account = results[0]
        const debtInfo = results[1]
        setAccountData(account)
        setEditData(account)
        setDebts(debtInfo.debts || [])
        setTotalDebt(debtInfo.totalDebt || 0)
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
    loadAll(accountId)
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  function getStatusClass(status) {
    if (!status) return 'unknown'
    return status.toLowerCase().replace(/\s+/g, '-')
  }

  function formatCurrency(value) {
    return `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function toggleCard(name) {
    setOpenCard(function(current) {
      if (current === name) {
        return null
      }
      return name
    })
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
      .then(function(res) {
        if (!res.ok) {
          throw new Error('Failed to save account changes')
        }
        return res.json()
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

  if (loading && debts.length === 0 && !accountData) {
    return (
      <div className="debt-view-container">
        <div className="card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="debt-view-container">
      <div className="card">
        <h2>Account Workspace</h2>

        {!accountData && !debts.length && !loading && (
          <form onSubmit={handleSubmit} className="debt-form">
            <div className="form-group">
              <label htmlFor="accountId">Account ID</label>
              <input
                type="text"
                id="accountId"
                value={accountId}
                onChange={function(e) { setAccountId(e.target.value) }}
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

        {(accountData || debts.length > 0) && (
          <div className="workspace">
              <div className="summary-bar">
                <div>
                  <p className="summary-label">Total owed to Treasury</p>
                  <p className="summary-value">{formatCurrency(totalDebt)}</p>
                </div>
                <button
                  className="btn-pay"
                  type="button"
                  onClick={function() {
                    window.open('https://www.pay.gov/public/form/entry/101/16531440/', '_blank', 'noopener')
                  }}
                >
                  Pay now
                </button>
              </div>

            <div className="accordion">
              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'info' ? 'open' : ''}`} onClick={function() { toggleCard('info') }}>
                  <span>My information</span>
                  <span className="chevron">{openCard === 'info' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'info' ? 'open' : ''}`}>
                  {accountData ? (
                    <>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="detail-label">Account Holder</span>
                          <span className="detail-value">{accountData.accountHolder || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status ${accountData.status?.toLowerCase() || 'unknown'}`}>
                            {accountData.status || 'N/A'}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="detail-label">Current Balance</span>
                          <span className="detail-value">{formatCurrency(accountData.currentBalance)}</span>
                        </div>
                      </div>

                      <div className="info-groups">
                        <div className="info-group">
                          <div className="info-group-header">
                            <h4>Contact email</h4>
                          </div>
                          <div className="info-group-body">
                            <label className="detail-label" htmlFor="workspace-email-input">
                              Email
                            </label>
                            <input
                              id="workspace-email-input"
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
                            <label className="detail-label" htmlFor="workspace-address1-input">
                              Address
                            </label>
                            <input
                              id="workspace-address1-input"
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
                            <label className="detail-label" htmlFor="workspace-phone-input">
                              Phone
                            </label>
                            <input
                              id="workspace-phone-input"
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
                            <label className="detail-label" htmlFor="workspace-taxpayer-input">
                              Taxpayer ID (SSN or EIN)
                            </label>
                            <div className="taxpayer-row">
                              <input
                                id="workspace-taxpayer-input"
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
                                {showTaxpayerId ? 'Hide' : 'Show'}
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
                    </>
                  ) : (
                    <p className="muted">Load an account to see information.</p>
                  )}
                </div>
              </div>

              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'debts' ? 'open' : ''}`} onClick={function() { toggleCard('debts') }}>
                  <span>Debts</span>
                  <span className="chevron">{openCard === 'debts' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'debts' ? 'open' : ''}`}>
                  {debts.length === 0 ? (
                    <p className="muted">No debts found for this account.</p>
                  ) : (
                    <div>
                      <div className="debts-table">
                        <div className="table-header">
                          <div className="table-cell">Debt ID</div>
                          <div className="table-cell">Amount</div>
                          <div className="table-cell">Date placed with Treasury</div>
                          <div className="table-cell">Status</div>
                        </div>
                        {debts.map(function(debt) {
                          return (
                            <div 
                              key={debt.debtId || debt.id} 
                              className={`table-row ${selectedDebt && (selectedDebt.debtId === debt.debtId) ? 'selected' : ''}`}
                            >
                              <div className="table-cell">
                                <span className="cell-label">Debt ID:</span>
                                <button
                                  type="button"
                                  className="debt-link-button"
                                  onClick={function() { setSelectedDebt(debt) }}
                                >
                                  {debt.debtId || debt.id || 'N/A'}
                                </button>
                              </div>
                              <div className="table-cell amount">
                                <span className="cell-label">Amount:</span>
                                {formatCurrency(debt.amount)}
                              </div>
                              <div className="table-cell">
                                <span className="cell-label">Date placed with Treasury:</span>
                                {formatDate(debt.datePlaced)}
                              </div>
                              <div className="table-cell">
                                <span className="cell-label">Status:</span>
                                <span className={`status-badge ${getStatusClass(debt.status)}`}>
                                  {debt.status || 'Unknown'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {selectedDebt && (
                        <div className="selected-debt-detail">
                          <h4>Debt details</h4>
                          <div className="detail-grid">
                            <div className="detail-item">
                              <span className="detail-label">Debt ID</span>
                              <span className="detail-value">{selectedDebt.debtId || selectedDebt.id || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Amount</span>
                              <span className="detail-value">{formatCurrency(selectedDebt.amount)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Due Date</span>
                              <span className="detail-value">{formatDate(selectedDebt.dueDate)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Date Debt Incurred</span>
                              <span className="detail-value">{formatDate(selectedDebt.dateIncurred)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Date Placed with Treasury</span>
                              <span className="detail-value">{formatDate(selectedDebt.datePlaced)}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Referring Government Agency</span>
                              <span className="detail-value">{selectedDebt.referringAgency || 'N/A'}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-secondary detail-close"
                            onClick={function() { setSelectedDebt(null) }}
                          >
                            Close details
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'dispute' ? 'open' : ''}`} onClick={function() { toggleCard('dispute') }}>
                  <span>Dispute / Request Garnishment Hearing</span>
                  <span className="chevron">{openCard === 'dispute' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'dispute' ? 'open' : ''}`}>
                  <p className="muted">
                    Start a dispute or request a garnishment hearing. Use this section to learn about your
                    options and access official hearing request forms.
                  </p>
                  <button
                    type="button"
                    className="btn-primary small-btn"
                    onClick={function() {
                      window.location.href = '/hearing'
                    }}
                  >
                    View hearing information and forms
                  </button>
                </div>
              </div>

              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'proof' ? 'open' : ''}`} onClick={function() { toggleCard('proof') }}>
                  <span>Proof of debt</span>
                  <span className="chevron">{openCard === 'proof' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'proof' ? 'open' : ''}`}>
                  <p className="muted">Request documentation for your debts. (Placeholder)</p>
                </div>
              </div>

              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'documents' ? 'open' : ''}`} onClick={function() { toggleCard('documents') }}>
                  <span>Documents</span>
                  <span className="chevron">{openCard === 'documents' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'documents' ? 'open' : ''}`}>
                  <p className="muted">Upload or view documents related to your account. (Placeholder)</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default DebtView

