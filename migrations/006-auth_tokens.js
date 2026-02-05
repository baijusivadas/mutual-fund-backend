"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auth_tokens", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: "auth_users", key: "id" },
        onDelete: "CASCADE",
      },
      token: { type: Sequelize.TEXT, unique: true },
      expires_at: Sequelize.DATE,
      used: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("auth_tokens");
  },
};
