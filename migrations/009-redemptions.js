"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('redemptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      scheme: { type: Sequelize.TEXT, allowNull: false },
      units: { type: Sequelize.DECIMAL(20,4), allowNull: false },
      nav: { type: Sequelize.DECIMAL(20,4), allowNull: false },
      amount: { type: Sequelize.DECIMAL(20,4), allowNull: false },
      folio: Sequelize.TEXT,
      investor_name: { type: Sequelize.TEXT, allowNull: false },
      transaction_type: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.addIndex("redemptions", ["investor_name"]);
    await queryInterface.addIndex("redemptions", ["scheme"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("redemptions");
  }
};
