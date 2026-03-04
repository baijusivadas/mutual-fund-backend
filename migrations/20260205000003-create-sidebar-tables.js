"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("sidebar_items", {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
            },
            name: { type: Sequelize.TEXT, allowNull: false },
            href: { type: Sequelize.TEXT, allowNull: false },
            icon: { type: Sequelize.TEXT, allowNull: false },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            parent_id: {
                type: Sequelize.UUID,
                references: { model: "sidebar_items", key: "id" },
                onDelete: "CASCADE",
            },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
        });

        await queryInterface.createTable("role_sidebar_items", {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "roles", key: "id" },
                onDelete: "CASCADE",
            },
            sidebar_item_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: "sidebar_items", key: "id" },
                onDelete: "CASCADE",
            },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
        });

        await queryInterface.addIndex("role_sidebar_items", ["role_id", "sidebar_item_id"], {
            unique: true,
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("role_sidebar_items");
        await queryInterface.dropTable("sidebar_items");
    },
};
