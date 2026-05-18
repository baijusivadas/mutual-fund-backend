module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: DataTypes.STRING(10)
  }, {
    tableName: 'states',
    underscored: true
  });

  State.associate = (models) => {
    State.belongsTo(models.Country, { foreignKey: 'country_id' });
  };

  return State;
};
