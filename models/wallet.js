module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    currency_id: DataTypes.UUID,
    balance: {
      type: DataTypes.NUMERIC,
      defaultValue: 0
    }
  }, {
    tableName: 'wallets',
    underscored: true
  });

  Wallet.associate = (models) => {
    Wallet.belongsTo(models.auth_users, { foreignKey: 'user_id' });
    Wallet.hasMany(models.WalletTransaction, { foreignKey: 'wallet_id' });
  };

  return Wallet;
};
