'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrganizationMember = sequelize.define(
    'OrganizationMember',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'auth_users',
          key: 'id',
        },
      },
      role: {
        type: DataTypes.STRING(50),
        defaultValue: 'client',
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'active',
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'organization_members',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['organization_id', 'user_id'],
        },
      ],
    }
  );

  OrganizationMember.associate = (models) => {
    OrganizationMember.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization',
    });
    if (models.auth_users) {
      OrganizationMember.belongsTo(models.auth_users, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  };

  return OrganizationMember;
};

