module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
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
    iso_code: {
      type: DataTypes.STRING(3),
      unique: true
    },
    phone_code: DataTypes.STRING(10)
  }, {
    tableName: 'countries',
    underscored: true
  });

  Country.associate = (models) => {
    Country.hasMany(models.State, { foreignKey: 'country_id' });
  };

  return Country;
};
