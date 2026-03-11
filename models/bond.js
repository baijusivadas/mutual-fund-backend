module.exports = (sequelize, DataTypes) => {
    const Bond = sequelize.define(
        "bonds",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            bond_name: DataTypes.TEXT,
            isin: DataTypes.TEXT,
            face_value: DataTypes.DECIMAL,
            quantity: DataTypes.DECIMAL,
            coupon_rate: DataTypes.DECIMAL,
            maturity_date: DataTypes.DATEONLY,
            purchase_date: DataTypes.DATEONLY,
            status: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return Bond;
};
