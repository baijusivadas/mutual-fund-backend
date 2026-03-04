'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("pending_users", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      email: { type: Sequelize.TEXT, unique: true, allowNull: false },
      password_hash: { type: Sequelize.TEXT, allowNull: false },
      otp: { type: Sequelize.STRING, allowNull: false },
      otp_expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("pending_users");
  },
};
