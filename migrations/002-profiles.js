'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: { model: "auth_users", key: "id" },
        onDelete: "CASCADE",
      },
      email: { type: Sequelize.TEXT, allowNull: false },
      full_name: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("profiles");
  },
};
