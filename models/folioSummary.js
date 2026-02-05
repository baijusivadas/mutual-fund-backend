module.exports = (sequelize, DataTypes) => {
  const folioSummary = sequelize.define(
    "folio_summary",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      folio_no: DataTypes.TEXT,
      investor: DataTypes.TEXT,
      total_investment: DataTypes.DECIMAL,
      total_redemption: DataTypes.DECIMAL,
      net_gain_loss: DataTypes.DECIMAL,
      current_units: DataTypes.DECIMAL,
      transaction_count: DataTypes.INTEGER,
      schemes_invested: DataTypes.INTEGER,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return folioSummary;
};
