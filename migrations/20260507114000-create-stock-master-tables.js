'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Stock Exchanges
    await queryInterface.createTable('stock_exchanges', {
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
      code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      country_id: {
        type: Sequelize.UUID,
        references: {
          model: 'countries',
          key: 'id'
        }
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

    // Stock Sectors
    await queryInterface.createTable('stock_sectors', {
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

    // Stocks
    await queryInterface.createTable('stocks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isin: {
        type: Sequelize.STRING,
        unique: true
      },
      sector_id: {
        type: Sequelize.UUID,
        references: {
          model: 'stock_sectors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Stock Prices (Daily)
    await queryInterface.createTable('stock_prices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      stock_id: {
        type: Sequelize.UUID,
        references: {
          model: 'stocks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      exchange_id: {
        type: Sequelize.UUID,
        references: {
          model: 'stock_exchanges',
          key: 'id'
        }
      },
      open_price: { type: Sequelize.NUMERIC },
      high_price: { type: Sequelize.NUMERIC },
      low_price: { type: Sequelize.NUMERIC },
      close_price: { type: Sequelize.NUMERIC, allowNull: false },
      volume: { type: Sequelize.BIGINT },
      price_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.addConstraint('stock_prices', {
      fields: ['stock_id', 'exchange_id', 'price_date'],
      type: 'unique',
      name: 'unique_stock_price_per_day'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stock_prices');
    await queryInterface.dropTable('stocks');
    await queryInterface.dropTable('stock_sectors');
    await queryInterface.dropTable('stock_exchanges');
  }
};
