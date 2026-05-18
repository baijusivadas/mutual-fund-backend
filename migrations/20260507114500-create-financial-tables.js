'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Wallets
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'auth_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      currency_id: {
        type: Sequelize.UUID,
        references: {
          model: 'currencies',
          key: 'id'
        }
      },
      balance: {
        type: Sequelize.NUMERIC,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Payment Methods
    await queryInterface.createTable('payment_methods', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'auth_users',
          key: 'id'
        }
      },
      method_type: {
        type: Sequelize.STRING // Card, UPI, Bank
      },
      provider: {
        type: Sequelize.STRING // Razorpay, Stripe, etc.
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Wallet Transactions
    await queryInterface.createTable('wallet_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      wallet_id: {
        type: Sequelize.UUID,
        references: {
          model: 'wallets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.NUMERIC,
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.STRING // Credit, Debit
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'Success'
      },
      reference_type: {
        type: Sequelize.STRING // Investment, Deposit, Withdrawal
      },
      reference_id: {
        type: Sequelize.UUID
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wallet_transactions');
    await queryInterface.dropTable('payment_methods');
    await queryInterface.dropTable('wallets');
  }
};
