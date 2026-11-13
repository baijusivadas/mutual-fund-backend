'use strict';

module.exports = (sequelize, DataTypes) => {
  const redemption = sequelize.define(
    'redemptions',
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      tenant_id: { type: DataTypes.UUID, allowNull: true },
      date: DataTypes.DATEONLY,
      scheme: DataTypes.TEXT,
      units: DataTypes.DECIMAL(20, 4),
      nav: DataTypes.DECIMAL(20, 4),
      amount: DataTypes.DECIMAL(20, 4),
      folio: DataTypes.TEXT,
      investor_name: DataTypes.TEXT,
      transaction_type: DataTypes.TEXT,
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { timestamps: false }
  );

  redemption.associate = (models) => {
    if (models.Organization) {
      redemption.belongsTo(models.Organization, { foreignKey: 'tenant_id', as: 'organization' });
    }
  };

  return redemption;
};
