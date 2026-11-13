'use strict';

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tier: {
        type: DataTypes.STRING(50),
        defaultValue: 'starter',
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active',
      },
      contact_email: {
        type: DataTypes.STRING,
        validate: { isEmail: true },
      },
      contact_phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.TEXT,
      },
      max_users: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      settings: {
        type: DataTypes.TEXT, // JSON serialized settings for maximum SQL dialect compatibility
        defaultValue: '{}',
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'organizations',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  Organization.associate = (models) => {
    Organization.hasMany(models.OrganizationMember, {
      foreignKey: 'organization_id',
      as: 'members',
    });
    if (models.auth_users) {
      Organization.hasMany(models.auth_users, {
        foreignKey: 'tenant_id',
        as: 'users',
      });
    }
    if (models.Investor) {
      Organization.hasMany(models.Investor, {
        foreignKey: 'tenant_id',
        as: 'investors',
      });
    }
    if (models.audit_logs) {
      Organization.hasMany(models.audit_logs, {
        foreignKey: 'tenant_id',
        as: 'auditLogs',
      });
    }
  };

  return Organization;
};

