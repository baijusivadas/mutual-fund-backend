module.exports = (sequelize, DataTypes) => {
  const MutualFund = sequelize.define('MutualFund', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fund_house_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isin: {
      type: DataTypes.STRING,
      unique: true
    },
    amfi_code: {
      type: DataTypes.STRING,
      unique: true
    },
    scheme_type: DataTypes.STRING, // Equity, Debt, etc.
    category: DataTypes.STRING, // Large Cap, Mid Cap, etc.
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'mutual_funds',
    underscored: true
  });

  MutualFund.associate = (models) => {
    MutualFund.belongsTo(models.FundHouse, { foreignKey: 'fund_house_id' });
    MutualFund.hasMany(models.NavHistory, { foreignKey: 'mutual_fund_id' });
  };

  return MutualFund;
};
