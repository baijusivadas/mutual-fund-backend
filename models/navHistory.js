module.exports = (sequelize, DataTypes) => {
  const NavHistory = sequelize.define('NavHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    mutual_fund_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nav_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nav_value: {
      type: DataTypes.NUMERIC,
      allowNull: false
    }
  }, {
    tableName: 'nav_history',
    underscored: true
  });

  NavHistory.associate = (models) => {
    NavHistory.belongsTo(models.MutualFund, { foreignKey: 'mutual_fund_id' });
  };

  return NavHistory;
};
