'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gold', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      item_name: Sequelize.TEXT,
      weight: Sequelize.DECIMAL,
      purity: Sequelize.TEXT,
      price: Sequelize.DECIMAL,
      purchase_date: Sequelize.DATEONLY,
      status: { type: Sequelize.TEXT, defaultValue: 'in_stock' },
      description: Sequelize.TEXT,
      created_by: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' }
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('gold');
  }
};
