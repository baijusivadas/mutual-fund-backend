const { UUID, TEXT, DECIMAL, INTEGER, DATEONLY, fn } = require("sequelize");

module.exports = (sequelize) => {
    const Derivative = sequelize.define(
        "derivatives",
        {
            id: { type: UUID, primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
            contract_name: TEXT,
            contract_type: TEXT,
            strike_price: DECIMAL,
            expiry_date: DATEONLY,
            purchase_price: DECIMAL,
            quantity: INTEGER,
            lot_size: INTEGER,
            status: { type: TEXT, defaultValue: 'active' },
            description: TEXT,
            created_by: UUID,
        },
        {
            underscored: true,
            timestamps: true,
        }
    );

    return Derivative;
};
