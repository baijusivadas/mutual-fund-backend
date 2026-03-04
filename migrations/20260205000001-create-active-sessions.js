'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("active_sessions", {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
            },
            auth_user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "auth_users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            token: { type: Sequelize.TEXT, allowNull: false },
            last_activity: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
            expires_at: { type: Sequelize.DATE, allowNull: false },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn("now") },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("active_sessions");
    },
};
