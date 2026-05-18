module.exports = (sequelize, DataTypes) => {
  const FundHouse = sequelize.define('FundHouse', {
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
    registration_number: DataTypes.STRING,
    website: DataTypes.STRING,
    logo_url: DataTypes.STRING
  }, {
    tableName: 'fund_houses',
    underscored: true
  });

  FundHouse.associate = (models) => {
    FundHouse.hasMany(models.MutualFund, { foreignKey: 'fund_house_id' });
  };

  return FundHouse;
};
