module.exports = (sequelize, DataTypes) => {
  const rawTransaction = sequelize.define(
    "raw_transactions",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      date: DataTypes.DATEONLY,
      scheme_name: DataTypes.TEXT,
      transaction_type: DataTypes.TEXT,
      units: DataTypes.DECIMAL(20, 4),
      nav: DataTypes.DECIMAL(20, 4),
      amount: DataTypes.DECIMAL(20, 4),
      folio_no: DataTypes.TEXT,
      investor_name: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return rawTransaction;
};
