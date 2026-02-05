module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    "Transaction",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: { type: DataTypes.DATE, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      units: { type: DataTypes.FLOAT, allowNull: false },
      nav: { type: DataTypes.FLOAT, allowNull: false },
      amount: { type: DataTypes.FLOAT, allowNull: false },
    },
    {
      tableName: "transactions",
    }
  );

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, { foreignKey: "user_id" });
    Transaction.belongsTo(models.Scheme, { foreignKey: "scheme_id" });
  };

  return Transaction;
};
