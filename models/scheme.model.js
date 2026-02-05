module.exports = (sequelize, DataTypes) => {
  const Scheme = sequelize.define(
    "Scheme",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "schemes",
      indexes: [{ unique: true, fields: ["name"] }],
    }
  );

  return Scheme;
};
