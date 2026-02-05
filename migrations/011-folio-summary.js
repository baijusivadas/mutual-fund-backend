"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('folio_summary', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      folio_no: { type: Sequelize.TEXT, allowNull: false },
      investor: { type: Sequelize.TEXT, allowNull: false },
      total_investment: { type: Sequelize.DECIMAL, defaultValue: 0 },
      total_redemption: { type: Sequelize.DECIMAL, defaultValue: 0 },
      net_gain_loss: { type: Sequelize.DECIMAL, defaultValue: 0 },
      current_units: { type: Sequelize.DECIMAL, defaultValue: 0 },
      transaction_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      schemes_invested: { type: Sequelize.INTEGER, defaultValue: 0 },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });

    await queryInterface.addConstraint('folio_summary', {
      fields: ['folio_no', 'investor'],
      type: 'unique',
      name: 'unique_folio_investor'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("folio_summary");
  }
};
