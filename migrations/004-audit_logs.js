"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal("gen_random_uuid()") },
      performed_by: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' }
      },
      target_user_id: {
        type: Sequelize.UUID,
        references: { model: 'auth_users', key: 'id' }
      },
      action: Sequelize.TEXT,
      old_value: Sequelize.TEXT,
      new_value: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
    async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  },
};
