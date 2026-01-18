const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Account Model
const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['checking', 'savings', 'business']],
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'frozen', 'closed']],
    },
  },
}, {
  tableName: 'accounts',
  timestamps: true,
});

// Transaction Model
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['transfer', 'deposit', 'withdrawal']],
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'failed']],
    },
  },
  amount: {
    type: DataTypes.DECIMAL(19, 4),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'transactions',
  timestamps: true,
});

// Ledger Entry Model
const LedgerEntry = sequelize.define('LedgerEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  entryType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['debit', 'credit']],
    },
  },
  amount: {
    type: DataTypes.DECIMAL(19, 4),
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
}, {
  tableName: 'ledger_entries',
  timestamps: true,
});

// Relationships
Account.hasMany(LedgerEntry, { foreignKey: 'accountId' });
LedgerEntry.belongsTo(Account, { foreignKey: 'accountId' });

Transaction.hasMany(LedgerEntry, { foreignKey: 'transactionId' });
LedgerEntry.belongsTo(Transaction, { foreignKey: 'transactionId' });

Account.hasMany(Transaction, { foreignKey: 'sourceAccountId', as: 'SourceTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'sourceAccountId', as: 'SourceAccount' });

Account.hasMany(Transaction, { foreignKey: 'destinationAccountId', as: 'DestinationTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'destinationAccountId', as: 'DestinationAccount' });

module.exports = {
  Account,
  Transaction,
  LedgerEntry,
  sequelize,
};