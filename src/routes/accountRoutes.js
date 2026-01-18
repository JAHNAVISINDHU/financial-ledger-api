const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Create new account
router.post('/', accountController.createAccount);

// Get account details with balance
router.get('/:accountId', accountController.getAccount);

// Get ledger entries for account
router.get('/:accountId/ledger', accountController.getAccountLedger);

module.exports = router;