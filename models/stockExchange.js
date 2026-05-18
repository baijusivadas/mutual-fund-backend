module.exports = (sequelize, DataTypes) => {
  const StockExchange = sequelize.define('StockExchange', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    country_id: DataTypes.UUID
  }, {
    tableName: 'stock_exchanges',
    underscored: true
  });

  StockExchange.associate = (models) => {
    StockExchange.hasMany(models.StockPrice, { foreignKey: 'exchange_id' });
  };

  return StockExchange;
};
