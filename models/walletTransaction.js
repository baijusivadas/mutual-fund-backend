module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    wallet_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.NUMERIC,
      allowNull: false
    },
    transaction_type: DataTypes.STRING, // Credit, Debit
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Success'
    },
    reference_type: DataTypes.STRING,
    reference_id: DataTypes.UUID
  }, {
    tableName: 'wallet_transactions',
    underscored: true
  });

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.Wallet, { foreignKey: 'wallet_id' });
  };

  return WalletTransaction;
};
