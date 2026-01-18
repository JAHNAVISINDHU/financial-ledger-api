const { LedgerEntry, sequelize } = require('../models');

class BalanceCalculator {
  static async calculateBalance(accountId) {
    const result = await LedgerEntry.findAll({
      attributes: [
        'entryType',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: { accountId },
      group: ['entryType'],
      raw: true,
    });

    let balance = 0;
    
    result.forEach(row => {
      if (row.entryType === 'credit') {
        balance += parseFloat(row.total);
      } else if (row.entryType === 'debit') {
        balance -= parseFloat(row.total);
      }
    });

    return balance;
  }

  static async hasSufficientFunds(accountId, amount) {
    const balance = await this.calculateBalance(accountId);
    return balance >= amount;
  }
}

module.exports = BalanceCalculator;