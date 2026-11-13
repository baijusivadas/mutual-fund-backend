'use strict';

module.exports = (sequelize, DataTypes) => {
  const auditLog = sequelize.define(
    'audit_logs',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      target_user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      action: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      entity_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      old_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      new_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'success',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: false,
    }
  );

  auditLog.associate = (models) => {
    if (models.Organization) {
      auditLog.belongsTo(models.Organization, { foreignKey: 'tenant_id', as: 'organization' });
    }
    if (models.auth_users) {
      auditLog.belongsTo(models.auth_users, { foreignKey: 'performed_by', as: 'performer' });
      auditLog.belongsTo(models.auth_users, { foreignKey: 'target_user_id', as: 'targetUser' });
    }
  };

  return auditLog;
};
