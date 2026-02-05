"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_roles", {
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
      role: { type: Sequelize.ENUM("superAdmin", "user"), allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("user_roles");
  },
};
