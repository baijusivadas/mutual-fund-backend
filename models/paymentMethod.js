module.exports = (sequelize, DataTypes) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    method_type: DataTypes.STRING, // Card, UPI, Bank
    provider: DataTypes.STRING, // Razorpay, Stripe, etc.
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'payment_methods',
    underscored: true
  });

  PaymentMethod.associate = (models) => {
    PaymentMethod.belongsTo(models.auth_users, { foreignKey: 'user_id' });
  };

  return PaymentMethod;
};
