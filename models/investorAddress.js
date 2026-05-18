module.exports = (sequelize, DataTypes) => {
  const InvestorAddress = sequelize.define('InvestorAddress', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    investor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    address_line1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address_line2: DataTypes.STRING,
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state_id: DataTypes.UUID,
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    address_type: {
      type: DataTypes.STRING,
      defaultValue: 'Residential'
    }
  }, {
    tableName: 'investor_addresses',
    underscored: true
  });

  InvestorAddress.associate = (models) => {
    InvestorAddress.belongsTo(models.Investor, { foreignKey: 'investor_id' });
  };

  return InvestorAddress;
};
