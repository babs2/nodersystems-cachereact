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
    // from the InterSystems IRIS / Caché database and shaping the JSON:
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
              <button className="btn-pay">Pay now</button>
            </div>

            <div className="accordion">
              <div className="accordion-card">
                <button className={`accordion-header ${openCard === 'info' ? 'open' : ''}`} onClick={function() { toggleCard('info') }}>
                  <span>My information</span>
                  <span className="chevron">{openCard === 'info' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'info' ? 'open' : ''}`}>
                  {accountData ? (
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="detail-label">Account Number</span>
                        <span className="detail-value">{accountData.accountNumber || 'N/A'}</span>
                      </div>
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
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{accountData.email || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{accountData.phone || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="detail-label">Current Balance</span>
                        <span className="detail-value">{formatCurrency(accountData.currentBalance)}</span>
                      </div>
                    </div>
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
                          <div className="table-cell">Due Date</div>
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
                                <span className="cell-label">Due Date:</span>
                                {formatDate(debt.dueDate)}
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
                              <span className="detail-label">Description</span>
                              <span className="detail-value">{selectedDebt.description || 'N/A'}</span>
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
                  <span>Dispute</span>
                  <span className="chevron">{openCard === 'dispute' ? '−' : '+'}</span>
                </button>
                <div className={`accordion-body ${openCard === 'dispute' ? 'open' : ''}`}>
                  <p className="muted">Start a dispute by contacting support or submitting a dispute form. (Placeholder)</p>
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

            <button 
              onClick={function() {
                setDebts([])
                setAccountId('')
                setAccountData(null)
                setTotalDebt(0)
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

export default DebtView

