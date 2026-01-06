import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Cache database configuration
const CACHE_CONFIG = {
  host: process.env.CACHE_HOST || 'localhost',
  port: Number(process.env.CACHE_PORT) || 1972,
  namespace: process.env.CACHE_NAMESPACE || 'USER',
  username: process.env.CACHE_USERNAME || '_SYSTEM',
  password: process.env.CACHE_PASSWORD || 'SYS',
  // Base REST endpoint, e.g. http://localhost:52773/csp/user
  restEndpoint: process.env.CACHE_REST_ENDPOINT || null
}

// Small helper so we don't crash on very old Node versions without fetch.
const hasFetch = typeof fetch === 'function'

// Attempt to connect to InterSystems Caché.
// - If a REST endpoint is configured, we make a simple GET request to it.
// - If that request fails (network error, DNS, refused connection, etc.),
//   we treat that as "cannot connect" and the API routes will fall back to
//   the dummy data for account 12345.
async function connectToCache() {
  if (!CACHE_CONFIG.restEndpoint) {
    // No endpoint configured at all – consider this "not connected"
    return {
      connected: false,
      reason: 'CACHE_REST_ENDPOINT not configured'
    }
  }

  if (!hasFetch) {
    return {
      connected: false,
      reason: 'fetch API is not available in this Node.js version'
    }
  }

  try {
    // We don't assume any specific path; even a 401/404 means the
    // endpoint is reachable, which is good enough as a connectivity check.
    const response = await fetch(CACHE_CONFIG.restEndpoint, {
      method: 'GET'
    })

    return {
      connected: true,
      status: response.status
    }
  } catch (error) {
    console.error('Failed to connect to Cache REST endpoint:', error.message)
    return {
      connected: false,
      error: error.message
    }
  }
}

// Mock data for development/testing
// Remove this when connecting to actual Cache database.
//
// In a real implementation you would:
// 1) Call out to a REST service exposed by InterSystems Caché, OR
// 2) Use an ODBC / JDBC driver to run SQL against your Caché namespace.
//
// Example (REST) for account balance:
//   const res = await fetch(
//     `${CACHE_CONFIG.restEndpoint}/account/${accountId}`,
//     {
//       method: 'GET',
//       headers: {
//         'Authorization': `Basic ${Buffer.from(
//           `${CACHE_CONFIG.username}:${CACHE_CONFIG.password}`
//         ).toString('base64')}`,
//         'Accept': 'application/json'
//       }
//     }
//   )
//   const record = await res.json()
//   const accountFromCache = {
//     accountNumber: record.AccountNumber,
//     accountHolder: record.AccountHolder,
//     status: record.Status,
//     email: record.Email,
//     phone: record.Phone,
//     // this is the balance value coming directly from the InterSystems API:
//     currentBalance: record.CurrentBalance
//   }
//
// Then you would return `accountFromCache` instead of the mock object below.
const mockAccountData = {
  '12345': {
    accountNumber: '12345',
    accountHolder: 'John Doe',
    status: 'Active',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    city: 'Springfield',
    state: 'VA',
    zipCode: '22150',
    taxpayerId: '123-45-6789',
    currentBalance: 1250.50
  }
}

const mockDebtData = {
  '12345': {
    debts: [
      {
        debtId: 'DEBT001',
        amount: 850.25,
        dueDate: '2024-02-15',
        status: 'Active',
        dateIncurred: '2023-12-01',
        datePlaced: '2024-01-05',
        referringAgency: 'Consumer Finance Bureau'
      },
      {
        debtId: 'DEBT002',
        amount: 400.25,
        dueDate: '2024-02-20',
        status: 'Active',
        dateIncurred: '2023-11-10',
        datePlaced: '2023-12-15',
        referringAgency: 'Treasury Collections'
      },
      {
        debtId: 'DEBT003',
        amount: 0.00,
        status: 'Paid',
        dateIncurred: '2023-10-01',
        datePlaced: '2023-11-01',
        referringAgency: 'Treasury Collections'
      },
      {
        debtId: 'DEBT004',
        amount: 600.00,
        dueDate: '2024-03-10',
        status: 'In Garnishment',
        dateIncurred: '2023-09-15',
        datePlaced: '2024-02-20',
        referringAgency: 'Treasury Collections'
      }
    ],
    totalDebt: 1850.50
  }
}

// API Routes

// Health check
app.get('/api/health', async function(req, res) {
  // Also report whether we can currently reach the Cache REST endpoint.
  const cacheConnection = await connectToCache()

  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    cacheConfig: {
      host: CACHE_CONFIG.host,
      port: CACHE_CONFIG.port,
      namespace: CACHE_CONFIG.namespace,
      restEndpointConfigured: Boolean(CACHE_CONFIG.restEndpoint)
    },
    cacheConnection
  })
})

// Get account information
//
// IMPORTANT:
// This is the HTTP API that the React app calls: GET /api/account/:accountId
// Whatever JSON you send back here is what `AccountInfo.jsx` receives in `data`.
// The `currentBalance` field from Caché should be mapped into that JSON,
// so the React UI can display it without further transformation.
app.get('/api/account/:accountId', async function(req, res) {
  try {
    const { accountId } = req.params

    // First, see if we can reach the Cache REST endpoint.
    const cacheConnection = await connectToCache()

    if (cacheConnection.connected) {
      // Try to query Cache for this account ID
      try {
      // Example using a REST endpoint exposed by Caché:
        // Adjust the path based on your actual Cache REST API structure
        const url = `${CACHE_CONFIG.restEndpoint}/account/${encodeURIComponent(accountId)}`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${CACHE_CONFIG.username}:${CACHE_CONFIG.password}`
            ).toString('base64')}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const record = await response.json()
          
          // Map Cache response to the format expected by React
          const accountFromCache = {
            accountNumber: record.AccountNumber || record.accountNumber || accountId,
            accountHolder: record.AccountHolder || record.accountHolder || 'N/A',
            status: record.Status || record.status || 'Active',
            email: record.Email || record.email || 'N/A',
            phone: record.Phone || record.phone || 'N/A',
            currentBalance: record.CurrentBalance || record.currentBalance || 0
          }
          
          return res.json(accountFromCache)
        } else if (response.status === 404) {
          // Account not found in Cache
          return res.status(404).json({ error: 'Account not found in database' })
        } else {
          // Cache API returned an error - fall through to check for dummy data
          console.warn(`Cache API returned status ${response.status} for account ${accountId}`)
        }
      } catch (queryError) {
        // Query failed (network error, malformed response, etc.)
        // Fall through to check for dummy data as fallback
        console.warn(`Failed to query Cache for account ${accountId}:`, queryError.message)
      }
    }

    // If we get here, either:
    // 1. Cache is not connected, OR
    // 2. Cache query failed/returned error
    // In either case, if this is account 12345, return dummy data
    if (accountId === '12345' && mockAccountData[accountId]) {
      console.log(`Returning dummy data for account ${accountId} (Cache unavailable or query failed)`)
      return res.json(mockAccountData[accountId])
    }

    // For other accounts when Cache is unavailable, return error
    return res.status(503).json({
      error: 'Unable to connect to Cache database. Dummy data is only available for account 12345.'
    })
  } catch (error) {
    console.error('Error fetching account:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get debts for an account
app.get('/api/debts/:accountId', async function(req, res) {
  try {
    const { accountId } = req.params

    // First, see if we can reach the Cache REST endpoint.
    const cacheConnection = await connectToCache()

    if (cacheConnection.connected) {
      // Try to query Cache for debts for this account ID
      try {
        // Example structure - adjust the path based on your actual Cache REST API
        const url = `${CACHE_CONFIG.restEndpoint}/debts/${encodeURIComponent(accountId)}`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${CACHE_CONFIG.username}:${CACHE_CONFIG.password}`
            ).toString('base64')}`,
            'Accept': 'application/json'
          }
        })

        if (response.ok) {
          const record = await response.json()
          
          // Map Cache response to the format expected by React
          return res.json({
            debts: record.debts || record.Debts || [],
            totalDebt: record.totalDebt || record.TotalDebt || 0
          })
        } else if (response.status === 404) {
          // No debts found in Cache
          return res.json({ debts: [], totalDebt: 0 })
        } else {
          // Cache API returned an error - fall through to check for dummy data
          console.warn(`Cache API returned status ${response.status} for debts of account ${accountId}`)
        }
      } catch (queryError) {
        // Query failed - fall through to check for dummy data as fallback
        console.warn(`Failed to query Cache for debts of account ${accountId}:`, queryError.message)
      }
    }

    // If we get here, either:
    // 1. Cache is not connected, OR
    // 2. Cache query failed/returned error
    // In either case, if this is account 12345, return dummy data
    if (accountId === '12345' && mockDebtData[accountId]) {
      console.log(`Returning dummy debt data for account ${accountId} (Cache unavailable or query failed)`)
      return res.json(mockDebtData[accountId])
    }

    // For other accounts when Cache is unavailable, return empty debts
    return res.json({
      debts: [],
      totalDebt: 0
    })
  } catch (error) {
    console.error('Error fetching debts:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update account contact/address information
app.put('/api/account/:accountId', async function(req, res) {
  try {
    const { accountId } = req.params
    const updates = req.body || {}

    // Only allow specific fields to be updated
    const allowedFields = [
      'email',
      'phone',
      'address1',
      'address2',
      'city',
      'state',
      'zipCode',
      'taxpayerId'
    ]

    const filteredUpdates = {}
    allowedFields.forEach(function(field) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        filteredUpdates[field] = updates[field]
      }
    })

    // Try to update Cache if connected
    const cacheConnection = await connectToCache()
    if (cacheConnection.connected) {
      try {
        // Example of how you might call a REST endpoint to update account info.
        // Adjust the URL and payload to match your actual Caché API.
        const url = `${CACHE_CONFIG.restEndpoint}/account/${encodeURIComponent(accountId)}`
        await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${CACHE_CONFIG.username}:${CACHE_CONFIG.password}`
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(filteredUpdates)
        })
        // We ignore the response body here and rely on our local representation below.
      } catch (cacheError) {
        console.warn('Failed to update Cache account record, falling back to mock update only:', cacheError.message)
      }
    }

    // Always keep the in-memory mock in sync for account 12345 so the UI updates,
    // even if Cache is not connected.
    if (mockAccountData[accountId]) {
      mockAccountData[accountId] = {
        ...mockAccountData[accountId],
        ...filteredUpdates
      }
      return res.json(mockAccountData[accountId])
    }

    return res.status(404).json({ error: 'Account not found' })
  } catch (error) {
    console.error('Error updating account:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single debt detail
app.get('/api/debt/:debtId', async function(req, res) {
  try {
    const { debtId } = req.params

    // Find in mock data
    const allDebts = Object.values(mockDebtData).flatMap(function(entry) {
      return entry.debts
    })
    const debt = allDebts.find(function(item) {
      return item.debtId === debtId || item.id === debtId
    })

    if (debt) {
      return res.json(debt)
    }

    res.status(404).json({ error: 'Debt not found' })
  } catch (error) {
    console.error('Error fetching debt detail:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Start server
app.listen(PORT, function() {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Cache configuration: ${CACHE_CONFIG.host}:${CACHE_CONFIG.port}/${CACHE_CONFIG.namespace}`)
  console.log('Note: Will attempt to connect to Cache on each request and fall back to mock data for account 12345 if unavailable.')
})

