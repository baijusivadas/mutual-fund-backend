module.exports = (sequelize, DataTypes) => {
  const gold = sequelize.define(
    "gold",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      item_name: DataTypes.TEXT,
      weight: DataTypes.DECIMAL,
      purity: DataTypes.TEXT,
      price: DataTypes.DECIMAL,
      purchase_date: DataTypes.DATEONLY,
      status: DataTypes.TEXT,
      description: DataTypes.TEXT,
      created_by: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return gold;
};
