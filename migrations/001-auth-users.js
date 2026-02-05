'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auth_users", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      email: { type: Sequelize.TEXT, unique: true, allowNull: false },
      password_hash: { type: Sequelize.TEXT, allowNull: false },
      login_attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      last_login_at: Sequelize.DATE,
      last_failed_login: Sequelize.DATE,
      is_locked: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("auth_users");
  },
};
