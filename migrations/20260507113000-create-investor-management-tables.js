'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Investors
    await queryInterface.createTable('investors', {
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
        onDelete: 'CASCADE',
        allowNull: true
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pan: {
        type: Sequelize.STRING(10),
        unique: true
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      date_of_birth: {
        type: Sequelize.DATEONLY
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

    // Investor Addresses
    await queryInterface.createTable('investor_addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      investor_id: {
        type: Sequelize.UUID,
        references: {
          model: 'investors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address_line1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address_line2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state_id: {
        type: Sequelize.UUID,
        references: {
          model: 'states',
          key: 'id'
        }
      },
      pincode: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      address_type: {
        type: Sequelize.STRING,
        defaultValue: 'Residential'
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

    // Investor Bank Accounts
    await queryInterface.createTable('investor_bank_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      investor_id: {
        type: Sequelize.UUID,
        references: {
          model: 'investors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      account_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ifsc_code: {
        type: Sequelize.STRING(15),
        allowNull: false
      },
      account_type: {
        type: Sequelize.STRING,
        defaultValue: 'Savings'
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Investor KYC
    await queryInterface.createTable('investor_kyc', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      investor_id: {
        type: Sequelize.UUID,
        references: {
          model: 'investors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        unique: true
      },
      kyc_status: {
        type: Sequelize.STRING,
        defaultValue: 'Pending'
      },
      verified_at: {
        type: Sequelize.DATE
      },
      remarks: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('investors', ['user_id']);
    await queryInterface.addIndex('investors', ['pan']);
    await queryInterface.addIndex('investor_addresses', ['investor_id']);
    await queryInterface.addIndex('investor_bank_accounts', ['investor_id']);
    await queryInterface.addIndex('investor_kyc', ['investor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('investor_kyc');
    await queryInterface.dropTable('investor_bank_accounts');
    await queryInterface.dropTable('investor_addresses');
    await queryInterface.dropTable('investors');
  }
};
