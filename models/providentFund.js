module.exports = (sequelize, DataTypes) => {
    const ProvidentFund = sequelize.define(
        "provident_funds",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            fund_type: DataTypes.TEXT,
            current_value: DataTypes.DECIMAL,
            monthly_contribution: DataTypes.DECIMAL,
            interest_rate: DataTypes.DECIMAL,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return ProvidentFund;
};
