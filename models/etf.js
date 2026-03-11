module.exports = (sequelize, DataTypes) => {
    const Etf = sequelize.define(
        "etfs",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            etf_name: DataTypes.TEXT,
            symbol: DataTypes.TEXT,
            quantity: DataTypes.DECIMAL,
            purchase_price: DataTypes.DECIMAL,
            current_nav: DataTypes.DECIMAL,
            purchase_date: DataTypes.DATEONLY,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return Etf;
};
