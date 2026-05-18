'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Countries updates
    await queryInterface.addColumn('countries', 'phone_code', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
    await queryInterface.changeColumn('countries', 'iso_code', {
      type: Sequelize.STRING(3),
      allowNull: false,
      unique: true
    });

    // States updates
    await queryInterface.renameColumn('states', 'state_code', 'code');

    // Currencies updates
    await queryInterface.changeColumn('currencies', 'code', {
      type: Sequelize.STRING(3),
      allowNull: false,
      unique: true
    });
    await queryInterface.changeColumn('currencies', 'symbol', {
      type: Sequelize.STRING(5),
      allowNull: true
    });

    // Mutual Funds updates
    await queryInterface.addColumn('mutual_funds', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    // Fund Houses updates
    await queryInterface.addColumn('fund_houses', 'registration_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Fund Houses rollback
    await queryInterface.removeColumn('fund_houses', 'registration_number');

    // Mutual Funds rollback
    await queryInterface.removeColumn('mutual_funds', 'is_active');

    // Currencies rollback
    await queryInterface.changeColumn('currencies', 'symbol', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
    await queryInterface.changeColumn('currencies', 'code', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: true
    });

    // States rollback
    await queryInterface.renameColumn('states', 'code', 'state_code');

    // Countries rollback
    await queryInterface.changeColumn('countries', 'iso_code', {
      type: Sequelize.STRING(10),
      allowNull: false,
      unique: true
    });
    await queryInterface.removeColumn('countries', 'phone_code');
  }
};
