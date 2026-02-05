module.exports = (sequelize, DataTypes) => {
  const schemeSummary = sequelize.define(
    "scheme_summary",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      scheme_name: DataTypes.TEXT,
      total_purchased: DataTypes.DECIMAL,
      total_redeemed: DataTypes.DECIMAL,
      net_investment: DataTypes.DECIMAL,
      current_units: DataTypes.DECIMAL,
      net_value: DataTypes.DECIMAL,
      latest_nav: DataTypes.DECIMAL,
      total_investors: DataTypes.INTEGER,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return schemeSummary;
};
