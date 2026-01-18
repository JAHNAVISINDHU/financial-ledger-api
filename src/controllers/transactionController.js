const ledgerService = require('../services/ledgerService');

class TransactionController {
  async executeTransfer(req, res) {
    try {
      const transaction = await ledgerService.executeTransfer(req.body);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transfer completed successfully',
      });
    } catch (error) {
      console.error('Transfer error:', error);
      
      switch (error.message) {
        case 'One or both accounts not found':
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        
        case 'Source and destination accounts cannot be the same':
        case 'One or both accounts are not active':
        case 'Currency mismatch':
          return res.status(400).json({
            success: false,
            error: error.message,
          });
        
        case 'Insufficient funds':
          return res.status(422).json({
            success: false,
            error: error.message,
          });
        
        default:
          return res.status(500).json({
            success: false,
            error: 'Transfer failed',
          });
      }
    }
  }

  async executeDeposit(req, res) {
    try {
      const transaction = await ledgerService.executeDeposit(req.body);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Deposit completed successfully',
      });
    } catch (error) {
      console.error('Deposit error:', error);
      
      switch (error.message) {
        case 'Account not found':
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        
        case 'Account is not active':
        case 'Currency mismatch':
          return res.status(400).json({
            success: false,
            error: error.message,
          });
        
        default:
          return res.status(500).json({
            success: false,
            error: 'Deposit failed',
          });
      }
    }
  }

  async executeWithdrawal(req, res) {
    try {
      const transaction = await ledgerService.executeWithdrawal(req.body);
      
      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Withdrawal completed successfully',
      });
    } catch (error) {
      console.error('Withdrawal error:', error);
      
      switch (error.message) {
        case 'Account not found':
          return res.status(404).json({
            success: false,
            error: error.message,
          });
        
        case 'Account is not active':
        case 'Currency mismatch':
          return res.status(400).json({
            success: false,
            error: error.message,
          });
        
        case 'Insufficient funds':
          return res.status(422).json({
            success: false,
            error: error.message,
          });
        
        default:
          return res.status(500).json({
            success: false,
            error: 'Withdrawal failed',
          });
      }
    }
  }
}

module.exports = new TransactionController();