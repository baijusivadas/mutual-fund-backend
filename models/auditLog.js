module.exports = (sequelize, DataTypes) => {
  const auditLog = sequelize.define(
    "audit_logs",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      performed_by: DataTypes.UUID,
      target_user_id: DataTypes.UUID,
      action: DataTypes.TEXT,
      old_value: DataTypes.TEXT,
      new_value: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return auditLog;
};
