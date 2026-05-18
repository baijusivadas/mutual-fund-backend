module.exports = (sequelize, DataTypes) => {
  const InvestorKyc = sequelize.define('InvestorKyc', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    investor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    kyc_status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending'
    },
    verified_at: DataTypes.DATE,
    remarks: DataTypes.TEXT
  }, {
    tableName: 'investor_kyc',
    underscored: true
  });

  InvestorKyc.associate = (models) => {
    InvestorKyc.belongsTo(models.Investor, { foreignKey: 'investor_id' });
  };

  return InvestorKyc;
};
