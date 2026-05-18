'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fund Houses (AMCs)
    await queryInterface.createTable('fund_houses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      logo_url: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
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

    // Mutual Funds (Schemes)
    await queryInterface.createTable('mutual_funds', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      fund_house_id: {
        type: Sequelize.UUID,
        references: {
          model: 'fund_houses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scheme_type: {
        type: Sequelize.STRING // Equity, Debt, etc.
      },
      category: {
        type: Sequelize.STRING // Large Cap, Mid Cap, etc.
      },
      isin: {
        type: Sequelize.STRING,
        unique: true
      },
      amfi_code: {
        type: Sequelize.STRING,
        unique: true
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

    // NAV History
    await queryInterface.createTable('nav_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      mutual_fund_id: {
        type: Sequelize.UUID,
        references: {
          model: 'mutual_funds',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nav: {
        type: Sequelize.NUMERIC,
        allowNull: false
      },
      nav_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add unique constraint for NAV History
    await queryInterface.addConstraint('nav_history', {
      fields: ['mutual_fund_id', 'nav_date'],
      type: 'unique',
      name: 'unique_nav_per_day'
    });

    await queryInterface.addIndex('mutual_funds', ['fund_house_id']);
    await queryInterface.addIndex('mutual_funds', ['isin']);
    await queryInterface.addIndex('mutual_funds', ['amfi_code']);
    await queryInterface.addIndex('nav_history', ['mutual_fund_id']);
    await queryInterface.addIndex('nav_history', ['nav_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('nav_history');
    await queryInterface.dropTable('mutual_funds');
    await queryInterface.dropTable('fund_houses');
  }
};
