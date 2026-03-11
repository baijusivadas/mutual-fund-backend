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

        // 1. Crypto Investments
        await queryInterface.createTable('crypto_investments', {
            ...commonFields,
            item_name: Sequelize.TEXT,
            symbol: Sequelize.TEXT,
            quantity: Sequelize.DECIMAL,
            average_price: Sequelize.DECIMAL,
            current_price: Sequelize.DECIMAL,
            purchase_date: Sequelize.DATEONLY,
            status: { type: Sequelize.TEXT, defaultValue: 'active' },
            description: Sequelize.TEXT
        });

        // 2. Bonds
        await queryInterface.createTable('bonds', {
            ...commonFields,
            bond_name: Sequelize.TEXT,
            isin: Sequelize.TEXT,
            face_value: Sequelize.DECIMAL,
            quantity: Sequelize.DECIMAL,
            coupon_rate: Sequelize.DECIMAL,
            maturity_date: Sequelize.DATEONLY,
            purchase_date: Sequelize.DATEONLY,
            status: { type: Sequelize.TEXT, defaultValue: 'active' }
        });

        // 3. ETFs
        await queryInterface.createTable('etfs', {
            ...commonFields,
            etf_name: Sequelize.TEXT,
            symbol: Sequelize.TEXT,
            quantity: Sequelize.DECIMAL,
            purchase_price: Sequelize.DECIMAL,
            current_nav: Sequelize.DECIMAL,
            purchase_date: Sequelize.DATEONLY
        });

        // 4. NPS
        await queryInterface.createTable('nps_investments', {
            ...commonFields,
            pran: Sequelize.TEXT,
            amount_invested: Sequelize.DECIMAL,
            current_value: Sequelize.DECIMAL,
            scheme_preference: Sequelize.TEXT
        });

        // 5. Bank Accounts (Savings, FD, etc.)
        await queryInterface.createTable('bank_accounts', {
            ...commonFields,
            bank_name: Sequelize.TEXT,
            account_type: Sequelize.TEXT, // 'savings', 'current', 'fd', 'rd'
            account_number: Sequelize.TEXT,
            current_balance: Sequelize.DECIMAL,
            interest_rate: Sequelize.DECIMAL,
            maturity_date: Sequelize.DATEONLY,
            status: { type: Sequelize.TEXT, defaultValue: 'active' }
        });

        // 6. Provident Funds (EPF, PPF)
        await queryInterface.createTable('provident_funds', {
            ...commonFields,
            fund_type: Sequelize.TEXT, // 'EPF', 'PPF'
            current_value: Sequelize.DECIMAL,
            monthly_contribution: Sequelize.DECIMAL,
            interest_rate: Sequelize.DECIMAL
        });

        // 7. Liabilities (Loans)
        await queryInterface.createTable('liabilities', {
            ...commonFields,
            liability_name: Sequelize.TEXT,
            liability_type: Sequelize.TEXT, // 'home', 'car', 'personal'
            principal_amount: Sequelize.DECIMAL,
            outstanding_amount: Sequelize.DECIMAL,
            interest_rate: Sequelize.DECIMAL,
            monthly_payment: Sequelize.DECIMAL,
            start_date: Sequelize.DATEONLY,
            end_date: Sequelize.DATEONLY,
            lender: Sequelize.TEXT,
            status: { type: Sequelize.TEXT, defaultValue: 'active' },
            description: Sequelize.TEXT
        });

        // 8. Custom/Other Assets
        await queryInterface.createTable('custom_assets', {
            ...commonFields,
            asset_name: Sequelize.TEXT,
            asset_type: Sequelize.TEXT,
            current_value: Sequelize.DECIMAL,
            purchase_price: Sequelize.DECIMAL,
            purchase_date: Sequelize.DATEONLY,
            description: Sequelize.TEXT
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('custom_assets');
        await queryInterface.dropTable('liabilities');
        await queryInterface.dropTable('provident_funds');
        await queryInterface.dropTable('bank_accounts');
        await queryInterface.dropTable('nps_investments');
        await queryInterface.dropTable('etfs');
        await queryInterface.dropTable('bonds');
        await queryInterface.dropTable('crypto_investments');
    }
};
