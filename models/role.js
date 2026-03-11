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

  roles.associate = (models) => {
    roles.belongsToMany(models.sidebar_items, {
      through: "role_sidebar_items",
      foreignKey: "role_id",
      otherKey: "sidebar_item_id",
    });
  };

  return roles;
};
