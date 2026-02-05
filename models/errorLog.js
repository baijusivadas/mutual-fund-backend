module.exports = (sequelize, DataTypes) => {
  const error = sequelize.define(
    "error_logs",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      user_id: DataTypes.UUID,
      error_type: DataTypes.TEXT,
      message: DataTypes.TEXT,
      stack_trace: DataTypes.TEXT,
      ip_address: DataTypes.TEXT,
      user_agent: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return error;
};
