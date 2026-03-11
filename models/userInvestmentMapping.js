const { UUID, TEXT } = require("sequelize");

module.exports = (sequelize) => {
    const UserInvestmentMapping = sequelize.define(
        "user_investment_mappings",
        {
            id: { type: UUID, primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
            user_id: UUID,
            asset_type: TEXT,
            investor_name: TEXT,
            created_by: UUID,
        },
        {
            underscored: true,
            timestamps: true,
        }
    );

    return UserInvestmentMapping;
};
