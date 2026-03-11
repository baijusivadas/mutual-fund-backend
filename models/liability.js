module.exports = (sequelize, DataTypes) => {
    const Liability = sequelize.define(
        "liabilities",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            liability_name: DataTypes.TEXT,
            liability_type: DataTypes.TEXT,
            principal_amount: DataTypes.DECIMAL,
            outstanding_amount: DataTypes.DECIMAL,
            interest_rate: DataTypes.DECIMAL,
            monthly_payment: DataTypes.DECIMAL,
            start_date: DataTypes.DATEONLY,
            end_date: DataTypes.DATEONLY,
            lender: DataTypes.TEXT,
            status: DataTypes.TEXT,
            description: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return Liability;
};
