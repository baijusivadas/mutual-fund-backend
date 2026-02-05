module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, },
      folio: DataTypes.STRING,
      auth_user_id: {
        type: DataTypes.UUID,
        references: {
          model: "auth_users",
          key: "id",
        },
      },
    },
    {
      tableName: "users",
      indexes: [{ unique: true, fields: ["name", "folio"] }],
    }
  );

  User.associate = (models) => {
    User.belongsTo(models.auth_users, { foreignKey: "auth_user_id" });
  };

  return User;
};
