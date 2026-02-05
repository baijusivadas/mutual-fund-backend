module.exports = (sequelize, DataTypes) => {
  const userRole = sequelize.define('user_roles', {
    id: { type: DataTypes.UUID, primaryKey: true },
    user_id: DataTypes.UUID,
    role: DataTypes.STRING,
    created_at: DataTypes.DATE
  }, { timestamps: false });

  return userRole;
};
