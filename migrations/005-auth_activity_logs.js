"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auth_activity_logs", {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' },
        onDelete: 'CASCADE'
      },
      event_type: Sequelize.TEXT,
      ip_address: Sequelize.TEXT,
      user_agent: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
    async down(queryInterface) {
    await queryInterface.dropTable("auth_activity_logs");
  }
};
