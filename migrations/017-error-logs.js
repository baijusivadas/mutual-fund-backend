'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('error_logs', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' },
        onDelete: 'SET NULL'
      },
      error_type: Sequelize.TEXT,
      message: Sequelize.TEXT,
      stack_trace: Sequelize.TEXT,
      ip_address: Sequelize.TEXT,
      user_agent: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('error_logs');
  }
};
