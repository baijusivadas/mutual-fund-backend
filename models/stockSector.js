module.exports = (sequelize, DataTypes) => {
  const StockSector = sequelize.define('StockSector', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'stock_sectors',
    underscored: true
  });

  StockSector.associate = (models) => {
    StockSector.hasMany(models.Stock, { foreignKey: 'sector_id' });
  };

  return StockSector;
};
