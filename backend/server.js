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
  port: process.env.CACHE_PORT || 1972,
  namespace: process.env.CACHE_NAMESPACE || 'USER',
  username: process.env.CACHE_USERNAME || '_SYSTEM',
  password: process.env.CACHE_PASSWORD || 'SYS',
  // Alternative: Use REST API endpoint if available
  restEndpoint: process.env.CACHE_REST_ENDPOINT || null
}

// Simulated database connection helper
// Replace this with actual Cache connection using cacheodbc or REST API
function connectToCache() {
  // This is a placeholder - implement actual Cache connection
  // Example using REST API:
  // return fetch(`${CACHE_CONFIG.restEndpoint}/api/...`)
  
  // For now, return a mock connection indicator
  return {
    connected: true,
    config: CACHE_CONFIG
  }
}

// Mock data for development/testing
// Remove this when connecting to actual Cache database.
//
// In a real implementation you would:
// 1) Call out to a REST service exposed by InterSystems IRIS / Caché, OR
// 2) Use an ODBC / JDBC driver to run SQL against your IRIS / Caché namespace.
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
    currentBalance: 1250.50
  }
}

const mockDebtData = {
  '12345': {
    debts: [
      {
        debtId: 'DEBT001',
        description: 'Credit Card Balance',
        amount: 850.25,
        dueDate: '2024-02-15',
        status: 'Pending',
        dateIncurred: '2023-12-01',
        datePlaced: '2024-01-05',
        referringAgency: 'Consumer Finance Bureau'
      },
      {
        debtId: 'DEBT002',
        description: 'Personal Loan',
        amount: 400.25,
        dueDate: '2024-02-20',
        status: 'Pending',
        dateIncurred: '2023-11-10',
        datePlaced: '2023-12-15',
        referringAgency: 'Treasury Collections'
      }
    ],
    totalDebt: 1250.50
  }
}

// API Routes

// Health check
app.get('/api/health', function(req, res) {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    cacheConfig: {
      host: CACHE_CONFIG.host,
      port: CACHE_CONFIG.port,
      namespace: CACHE_CONFIG.namespace
    }
  })
})

// Get account information
//
// IMPORTANT:
// This is the HTTP API that the React app calls: GET /api/account/:accountId
// Whatever JSON you send back here is what `AccountInfo.jsx` receives in `data`.
// The `currentBalance` field from Caché/IRIS should be mapped into that JSON,
// so the React UI can display it without further transformation.
app.get('/api/account/:accountId', async function(req, res) {
  try {
    const { accountId } = req.params
    
    // TODO: Replace with actual Cache database query instead of mockAccountData.
    //
    // Example using a REST endpoint exposed by IRIS / Caché:
    //
    // const url = `${CACHE_CONFIG.restEndpoint}/account/${encodeURIComponent(accountId)}`
    // const response = await fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Basic ${Buffer.from(
    //       `${CACHE_CONFIG.username}:${CACHE_CONFIG.password}`
    //     ).toString('base64')}`,
    //     'Accept': 'application/json'
    //   }
    // })
    //
    // if (!response.ok) {
    //   return res.status(response.status).json({ error: 'Cache API error' })
    // }
    //
    // const record = await response.json()
    //
    // // Shape the raw Caché record into the JSON your React app expects:
    // const accountFromCache = {
    //   accountNumber: record.AccountNumber,
    //   accountHolder: record.AccountHolder,
    //   status: record.Status,
    //   email: record.Email,
    //   phone: record.Phone,
    //   // The balance coming from Caché/IRIS:
    //   currentBalance: record.CurrentBalance
    // }
    //
    // return res.json(accountFromCache)
    
    // For now, return mock data so the UI works without a live Cache connection.
    if (mockAccountData[accountId]) {
      return res.json(mockAccountData[accountId])
    }
    
    res.status(404).json({ error: 'Account not found' })
  } catch (error) {
    console.error('Error fetching account:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get debts for an account
app.get('/api/debts/:accountId', async function(req, res) {
  try {
    const { accountId } = req.params
    
    // TODO: Replace with actual Cache database query
    // Example query structure:
    // const query = `SELECT * FROM Debt WHERE AccountNumber = ? AND Status != 'Paid'`
    // const result = await cacheConnection.execute(query, [accountId])
    
    // For now, return mock data
    if (mockDebtData[accountId]) {
      return res.json(mockDebtData[accountId])
    }
    
    res.json({ debts: [], totalDebt: 0 })
  } catch (error) {
    console.error('Error fetching debts:', error)
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
  console.log('Note: Currently using mock data. Configure .env file for actual Cache connection.')
})

