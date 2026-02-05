module.exports = (sequelize, DataTypes) => {
  const authUser = sequelize.define(
    "auth_users",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      email: { type: DataTypes.TEXT, unique: true },
      password_hash: DataTypes.TEXT,
      login_attempts: DataTypes.INTEGER,
      last_login_at: DataTypes.DATE,
      last_failed_login: DataTypes.DATE,
      is_locked: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
    },
    { tableName: "auth_users", timestamps: false }
  );

  authUser.associate = (models) => {
    authUser.hasMany(models.User, { foreignKey: "auth_user_id" });
  };

  return authUser;
};
