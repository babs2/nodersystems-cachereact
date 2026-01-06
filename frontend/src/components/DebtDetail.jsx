import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import './DebtDetail.css'

function DebtDetail() {
  const { debtId } = useParams()
  const [debt, setDebt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    fetchDebtDetail(debtId)
  }, [debtId])

  function fetchDebtDetail(id) {
    setLoading(true)
    setError(null)

    fetch(`/api/debt/${id}`)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Debt not found')
        }
        return response.json()
      })
      .then(function(data) {
        setDebt(data)
        setLoading(false)
      })
      .catch(function(err) {
        setError(err.message)
        setLoading(false)
      })
  }

  function formatDate(value) {
    if (!value) return 'N/A'
    try {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return value
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <div className="card">
          <div className="loading-spinner">Loading debt...</div>
        </div>
      </div>
    )
  }

  if (error || !debt) {
    return (
      <div className="detail-page">
        <div className="card">
          <div className="error-message">{error || 'Debt not found'}</div>
          <Link to="/debts" className="btn-secondary">Back to debts</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <div className="card">
        <div className="detail-header">
          <h2>Debt {debt.debtId || debt.id}</h2>
          <Link to="/debts" className="btn-secondary">Back to debts</Link>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Description</span>
            <span className="detail-value">{debt.description || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Amount</span>
            <span className="detail-value amount">
              ${(debt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value">{debt.status || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Due Date</span>
            <span className="detail-value">{formatDate(debt.dueDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date Debt Incurred</span>
            <span className="detail-value">{formatDate(debt.dateIncurred)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date Placed with Treasury</span>
            <span className="detail-value">{formatDate(debt.datePlaced)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Referring Government Agency</span>
            <span className="detail-value">{debt.referringAgency || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtDetail

