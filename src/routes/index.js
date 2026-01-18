const express = require('express');
const router = express.Router();
const accountRoutes = require('./accountRoutes');
const transactionRoutes = require('./transactionRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'financial-ledger-api',
  });
});

// API documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Financial Ledger API with Double-Entry Bookkeeping',
    version: '1.0.0',
    endpoints: {
      accounts: {
        'POST /accounts': 'Create a new account',
        'GET /accounts/:accountId': 'Get account details with balance',
        'GET /accounts/:accountId/ledger': 'Get ledger entries for account',
      },
      transactions: {
        'POST /transfers': 'Execute a transfer between accounts',
        'POST /deposits': 'Execute a deposit into an account',
        'POST /withdrawals': 'Execute a withdrawal from an account',
      },
      health: {
        'GET /health': 'Health check endpoint',
      },
    },
  });
});

// Mount routes
router.use('/accounts', accountRoutes);
router.use('/', transactionRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

module.exports = router;