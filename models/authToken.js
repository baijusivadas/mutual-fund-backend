module.exports = (sequelize, DataTypes) => {
  const authToken = sequelize.define(
    "auth_tokens",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      user_id: DataTypes.UUID,
      token: DataTypes.TEXT,
      expires_at: DataTypes.DATE,
      used: DataTypes.BOOLEAN,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return authToken;
};
