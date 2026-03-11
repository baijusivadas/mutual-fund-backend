'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = [
            'crypto_investments',
            'bonds',
            'etfs',
            'nps_investments',
            'bank_accounts',
            'provident_funds',
            'liabilities',
            'custom_assets'
        ];

        for (const table of tables) {
            await queryInterface.addColumn(table, 'document_url', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tables = [
            'crypto_investments',
            'bonds',
            'etfs',
            'nps_investments',
            'bank_accounts',
            'provident_funds',
            'liabilities',
            'custom_assets'
        ];

        for (const table of tables) {
            await queryInterface.removeColumn(table, 'document_url');
        }
    }
};
