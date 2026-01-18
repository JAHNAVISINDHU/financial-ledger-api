const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Execute transfer between accounts
router.post('/transfers', transactionController.executeTransfer);

// Execute deposit into account
router.post('/deposits', transactionController.executeDeposit);

// Execute withdrawal from account
router.post('/withdrawals', transactionController.executeWithdrawal);

module.exports = router;