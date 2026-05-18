module.exports = (sequelize, DataTypes) => {
  const InvestorBankAccount = sequelize.define('InvestorBankAccount', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    investor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ifsc_code: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    account_type: {
      type: DataTypes.STRING,
      defaultValue: 'Savings'
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'investor_bank_accounts',
    underscored: true
  });

  InvestorBankAccount.associate = (models) => {
    InvestorBankAccount.belongsTo(models.Investor, { foreignKey: 'investor_id' });
  };

  return InvestorBankAccount;
};
