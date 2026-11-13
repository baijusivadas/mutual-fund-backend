'use strict';

module.exports = (sequelize, DataTypes) => {
  const Investor = sequelize.define(
    'Investor',
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pan: {
        type: DataTypes.STRING(10),
        unique: true,
      },
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      date_of_birth: DataTypes.DATEONLY,
    },
    {
      tableName: 'investors',
      underscored: true,
    }
  );

  Investor.associate = (models) => {
    Investor.belongsTo(models.auth_users, { foreignKey: 'user_id' });
    if (models.Organization) {
      Investor.belongsTo(models.Organization, { foreignKey: 'tenant_id', as: 'organization' });
    }
    Investor.hasOne(models.InvestorKyc, { foreignKey: 'investor_id' });
    Investor.hasMany(models.InvestorAddress, { foreignKey: 'investor_id' });
    Investor.hasMany(models.InvestorBankAccount, { foreignKey: 'investor_id' });
  };

  return Investor;
};
