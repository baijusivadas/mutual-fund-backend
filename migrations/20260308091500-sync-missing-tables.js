'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const commonFields = {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
            created_by: {
                type: Sequelize.UUID,
                references: { model: 'auth_users', key: 'id' }
            },
            created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
            updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
        };

        // 1. Derivatives
        await queryInterface.createTable('derivatives', {
            ...commonFields,
            contract_name: Sequelize.TEXT,
            contract_type: Sequelize.TEXT, // 'Future', 'Call Option', 'Put Option'
            strike_price: Sequelize.DECIMAL,
            expiry_date: Sequelize.DATEONLY,
            purchase_price: Sequelize.DECIMAL,
            quantity: Sequelize.INTEGER,
            lot_size: Sequelize.INTEGER,
            status: { type: Sequelize.TEXT, defaultValue: 'active' },
            description: Sequelize.TEXT
        });

        // 2. User Investment Mappings
        await queryInterface.createTable('user_investment_mappings', {
            ...commonFields,
            user_id: {
                type: Sequelize.UUID,
                references: { model: 'auth_users', key: 'id' }
            },
            asset_type: Sequelize.TEXT,
            investor_name: Sequelize.TEXT
        });

        // 3. Notification History
        await queryInterface.createTable('notification_history', {
            ...commonFields,
            notification_type: Sequelize.TEXT,
            recipient_email: Sequelize.TEXT,
            subject: Sequelize.TEXT,
            property_name: Sequelize.TEXT,
            tenant_name: Sequelize.TEXT,
            status: { type: Sequelize.TEXT, defaultValue: 'sent' }, // 'sent', 'failed'
            sent_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('notification_history');
        await queryInterface.dropTable('user_investment_mappings');
        await queryInterface.dropTable('derivatives');
    }
};
