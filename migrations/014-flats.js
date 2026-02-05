'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flats', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      flat_name: Sequelize.TEXT,
      location: Sequelize.TEXT,
      price: Sequelize.DECIMAL,
      bedrooms: Sequelize.INTEGER,
      bathrooms: Sequelize.INTEGER,
      area: Sequelize.DECIMAL,
      floor: Sequelize.INTEGER,
      status: { type: Sequelize.TEXT, defaultValue: 'available' },
      description: Sequelize.TEXT,
      images: Sequelize.ARRAY(Sequelize.TEXT),
      created_by: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' }
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('flats');
  }
};
