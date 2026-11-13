'use strict';

module.exports = (sequelize, DataTypes) => {
  const authUser = sequelize.define(
    'auth_users',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      tenant_id: { type: DataTypes.UUID, allowNull: true },
      email: { type: DataTypes.TEXT, unique: true },
      password_hash: DataTypes.TEXT,
      login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      last_login_at: DataTypes.DATE,
      last_failed_login: DataTypes.DATE,
      is_locked: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: 'auth_users', timestamps: false }
  );

  authUser.associate = (models) => {
    authUser.hasMany(models.User, { foreignKey: 'auth_user_id' });
    if (models.Organization) {
      authUser.belongsTo(models.Organization, { foreignKey: 'tenant_id', as: 'organization' });
    }
    if (models.OrganizationMember) {
      authUser.hasMany(models.OrganizationMember, { foreignKey: 'user_id', as: 'memberships' });
    }
  };

  return authUser;
};
