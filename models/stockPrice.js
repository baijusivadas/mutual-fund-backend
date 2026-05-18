module.exports = (sequelize, DataTypes) => {
  const StockPrice = sequelize.define('StockPrice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    stock_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    exchange_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    open_price: DataTypes.NUMERIC,
    high_price: DataTypes.NUMERIC,
    low_price: DataTypes.NUMERIC,
    close_price: {
      type: DataTypes.NUMERIC,
      allowNull: false
    },
    volume: DataTypes.BIGINT,
    price_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: 'stock_prices',
    underscored: true
  });

  StockPrice.associate = (models) => {
    StockPrice.belongsTo(models.Stock, { foreignKey: 'stock_id' });
    StockPrice.belongsTo(models.StockExchange, { foreignKey: 'exchange_id' });
  };

  return StockPrice;
};
