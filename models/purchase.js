module.exports = (sequelize, DataTypes) => {
  const purchase = sequelize.define(
    "purchases",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      date: DataTypes.DATEONLY,
      scheme: DataTypes.TEXT,
      units: DataTypes.DECIMAL(20, 4),
      nav: DataTypes.DECIMAL(20, 4),
      amount: DataTypes.DECIMAL(20, 4),
      folio: DataTypes.TEXT,
      investor_name: DataTypes.TEXT,
      transaction_type: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return purchase;
};
