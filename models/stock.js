module.exports = (sequelize, DataTypes) => {
  const Stock = sequelize.define('Stock', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isin: {
      type: DataTypes.STRING,
      unique: true
    },
    sector_id: DataTypes.UUID
  }, {
    tableName: 'stocks',
    underscored: true
  });

  Stock.associate = (models) => {
    Stock.belongsTo(models.StockSector, { foreignKey: 'sector_id' });
    Stock.hasMany(models.StockPrice, { foreignKey: 'stock_id' });
  };

  return Stock;
};
