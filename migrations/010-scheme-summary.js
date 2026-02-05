"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scheme_summary', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      scheme_name: { type: Sequelize.TEXT, unique: true },
      total_purchased: { type: Sequelize.DECIMAL, defaultValue: 0 },
      total_redeemed: { type: Sequelize.DECIMAL, defaultValue: 0 },
      net_investment: { type: Sequelize.DECIMAL, defaultValue: 0 },
      current_units: { type: Sequelize.DECIMAL, defaultValue: 0 },
      net_value: { type: Sequelize.DECIMAL, defaultValue: 0 },
      latest_nav: Sequelize.DECIMAL,
      total_investors: { type: Sequelize.INTEGER, defaultValue: 0 },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.addIndex("scheme_summary", ["scheme_name"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("scheme_summary");
  }
};
