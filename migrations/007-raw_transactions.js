"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("raw_transactions", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      date: Sequelize.DATEONLY,
      scheme_name: Sequelize.TEXT,
      transaction_type: Sequelize.TEXT,
      units: Sequelize.DECIMAL(20, 4),
      nav: Sequelize.DECIMAL(20, 4),
      amount: Sequelize.DECIMAL(20, 4),
      folio_no: Sequelize.TEXT,
      investor_name: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("raw_transactions");
  },
};
