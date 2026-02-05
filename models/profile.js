module.exports = (sequelize, DataTypes) => {
  const profile = sequelize.define('profiles', {
    id: { type: DataTypes.UUID, primaryKey: true },
    email: DataTypes.TEXT,
    full_name: DataTypes.TEXT,
    created_at: DataTypes.DATE
  }, { timestamps: false });
  return profile;
};
