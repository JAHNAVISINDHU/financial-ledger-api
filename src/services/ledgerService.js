const { Account, Transaction, LedgerEntry, sequelize } = require('../models');
const BalanceCalculator = require('../utils/balanceCalculator');

class LedgerService {
  async createAccount(data) {
    return await Account.create(data);
  }

  async getAccountWithBalance(accountId) {
    const account = await Account.findByPk(accountId);
    if (!account) throw new Error('Account not found');
    
    const balance = await BalanceCalculator.calculateBalance(accountId);
    
    return {
      ...account.toJSON(),
      balance: balance.toFixed(2),
    };
  }

  async getAccountLedger(accountId) {
    const ledgerEntries = await LedgerEntry.findAll({
      where: { accountId },
      include: [{
        model: Transaction,
        attributes: ['id', 'type', 'description', 'status', 'amount'],
      }],
      order: [['createdAt', 'DESC']],
    });

    return ledgerEntries;
  }

  async executeTransfer(data) {
    const { sourceAccountId, destinationAccountId, amount, currency = 'USD', description = '' } = data;

    if (sourceAccountId === destinationAccountId) {
      throw new Error('Source and destination accounts cannot be the same');
    }

    const [sourceAccount, destinationAccount] = await Promise.all([
      Account.findByPk(sourceAccountId),
      Account.findByPk(destinationAccountId),
    ]);

    if (!sourceAccount || !destinationAccount) {
      throw new Error('One or both accounts not found');
    }

    if (sourceAccount.status !== 'active' || destinationAccount.status !== 'active') {
      throw new Error('One or both accounts are not active');
    }

    if (sourceAccount.currency !== currency || destinationAccount.currency !== currency) {
      throw new Error('Currency mismatch');
    }

    const transaction = await sequelize.transaction();

    try {
      // Check sufficient funds
      const hasFunds = await BalanceCalculator.hasSufficientFunds(sourceAccountId, amount);
      if (!hasFunds) throw new Error('Insufficient funds');

      // Create transaction record
      const transactionRecord = await Transaction.create({
        type: 'transfer',
        status: 'pending',
        amount,
        currency,
        sourceAccountId,
        destinationAccountId,
        description,
      }, { transaction });

      // Create double-entry ledger entries
      await Promise.all([
        LedgerEntry.create({
          accountId: sourceAccountId,
          transactionId: transactionRecord.id,
          entryType: 'debit',
          amount,
        }, { transaction }),
        
        LedgerEntry.create({
          accountId: destinationAccountId,
          transactionId: transactionRecord.id,
          entryType: 'credit',
          amount,
        }, { transaction }),
      ]);

      // Update transaction status
      transactionRecord.status = 'completed';
      await transactionRecord.save({ transaction });

      await transaction.commit();
      return transactionRecord;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async executeDeposit(data) {
    const { accountId, amount, currency = 'USD', description = 'Deposit' } = data;

    const account = await Account.findByPk(accountId);
    if (!account) throw new Error('Account not found');
    if (account.status !== 'active') throw new Error('Account is not active');
    if (account.currency !== currency) throw new Error('Currency mismatch');

    const dbTransaction = await sequelize.transaction();

    try {
      // Create transaction record
      const transactionRecord = await Transaction.create({
        type: 'deposit',
        status: 'pending',
        amount,
        currency,
        destinationAccountId: accountId,
        description,
      }, { transaction: dbTransaction });

      // Create credit ledger entry
      await LedgerEntry.create({
        accountId,
        transactionId: transactionRecord.id,
        entryType: 'credit',
        amount,
      }, { transaction: dbTransaction });

      // Update transaction status
      transactionRecord.status = 'completed';
      await transactionRecord.save({ transaction: dbTransaction });

      await dbTransaction.commit();
      return transactionRecord;

    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  async executeWithdrawal(data) {
    const { accountId, amount, currency = 'USD', description = 'Withdrawal' } = data;

    const account = await Account.findByPk(accountId);
    if (!account) throw new Error('Account not found');
    if (account.status !== 'active') throw new Error('Account is not active');
    if (account.currency !== currency) throw new Error('Currency mismatch');

    const dbTransaction = await sequelize.transaction();

    try {
      // Check sufficient funds
      const hasFunds = await BalanceCalculator.hasSufficientFunds(accountId, amount);
      if (!hasFunds) throw new Error('Insufficient funds');

      // Create transaction record
      const transactionRecord = await Transaction.create({
        type: 'withdrawal',
        status: 'pending',
        amount,
        currency,
        sourceAccountId: accountId,
        description,
      }, { transaction: dbTransaction });

      // Create debit ledger entry
      await LedgerEntry.create({
        accountId,
        transactionId: transactionRecord.id,
        entryType: 'debit',
        amount,
      }, { transaction: dbTransaction });

      // Update transaction status
      transactionRecord.status = 'completed';
      await transactionRecord.save({ transaction: dbTransaction });

      await dbTransaction.commit();
      return transactionRecord;

    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }
}

module.exports = new LedgerService();