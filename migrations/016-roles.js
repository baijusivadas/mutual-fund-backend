"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      name: { type: Sequelize.TEXT, unique: true },
      description: Sequelize.TEXT,
      is_system_role: { type: Sequelize.BOOLEAN, defaultValue: false },
      parent_id: {
        type: Sequelize.UUID,
        references: { model: "roles", key: "id" },
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};
