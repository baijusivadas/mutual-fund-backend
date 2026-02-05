module.exports = (sequelize, DataTypes) => {
  const roles = sequelize.define(
    "roles",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      is_system_role: DataTypes.BOOLEAN,
      parent_id: DataTypes.UUID,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return roles;
};
