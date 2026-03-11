module.exports = (sequelize, DataTypes) => {
    const NpsInvestment = sequelize.define(
        "nps_investments",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            pran: DataTypes.TEXT,
            amount_invested: DataTypes.DECIMAL,
            current_value: DataTypes.DECIMAL,
            scheme_preference: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return NpsInvestment;
};
