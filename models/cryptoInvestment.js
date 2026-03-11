module.exports = (sequelize, DataTypes) => {
    const CryptoInvestment = sequelize.define(
        "crypto_investments",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            item_name: DataTypes.TEXT,
            symbol: DataTypes.TEXT,
            quantity: DataTypes.DECIMAL,
            average_price: DataTypes.DECIMAL,
            current_price: DataTypes.DECIMAL,
            purchase_date: DataTypes.DATEONLY,
            status: DataTypes.TEXT,
            description: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return CryptoInvestment;
};
