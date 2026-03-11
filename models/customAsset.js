module.exports = (sequelize, DataTypes) => {
    const CustomAsset = sequelize.define(
        "custom_assets",
        {
            id: { type: DataTypes.UUID, primaryKey: true },
            asset_name: DataTypes.TEXT,
            asset_type: DataTypes.TEXT,
            current_value: DataTypes.DECIMAL,
            purchase_price: DataTypes.DECIMAL,
            purchase_date: DataTypes.DATEONLY,
            description: DataTypes.TEXT,
            created_by: DataTypes.UUID,
            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        { timestamps: false }
    );
    return CustomAsset;
};
