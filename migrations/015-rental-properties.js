'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rental_properties', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      property_name: Sequelize.TEXT,
      location: Sequelize.TEXT,
      monthly_rent: Sequelize.DECIMAL,
      deposit: Sequelize.DECIMAL,
      bedrooms: Sequelize.INTEGER,
      bathrooms: Sequelize.INTEGER,
      area: Sequelize.DECIMAL,
      status: { type: Sequelize.TEXT, defaultValue: 'available' },
      tenant_name: Sequelize.TEXT,
      lease_start_date: Sequelize.DATEONLY,
      lease_end_date: Sequelize.DATEONLY,
      created_by: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' }
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('rental_properties');
  }
};
