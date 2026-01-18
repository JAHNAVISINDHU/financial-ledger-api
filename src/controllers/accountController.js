const ledgerService = require('../services/ledgerService');

class AccountController {
  async createAccount(req, res) {
    try {
      const account = await ledgerService.createAccount(req.body);
      
      res.status(201).json({
        success: true,
        data: account,
        message: 'Account created successfully',
      });
    } catch (error) {
      console.error('Create account error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to create account',
      });
    }
  }

  async getAccount(req, res) {
    try {
      const { accountId } = req.params;
      const account = await ledgerService.getAccountWithBalance(accountId);
      
      res.json({
        success: true,
        data: account,
      });
    } catch (error) {
      console.error('Get account error:', error);
      
      if (error.message === 'Account not found') {
        return res.status(404).json({
          success: false,
          error: 'Account not found',
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch account',
      });
    }
  }

  async getAccountLedger(req, res) {
    try {
      const { accountId } = req.params;
      const ledgerEntries = await ledgerService.getAccountLedger(accountId);
      
      res.json({
        success: true,
        data: ledgerEntries,
      });
    } catch (error) {
      console.error('Get ledger error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to fetch ledger entries',
      });
    }
  }
}

module.exports = new AccountController();