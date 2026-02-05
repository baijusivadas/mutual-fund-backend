'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('real_estate', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      property_name: Sequelize.TEXT,
      location: Sequelize.TEXT,
      price: Sequelize.DECIMAL,
      area: Sequelize.DECIMAL,
      property_type: Sequelize.TEXT,
      status: { type: Sequelize.TEXT, defaultValue: 'available' },
      description: Sequelize.TEXT,
      images: Sequelize.ARRAY(Sequelize.TEXT),
      created_by: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('real_estate');
  }
};
