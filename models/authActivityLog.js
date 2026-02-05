module.exports = (sequelize, DataTypes) => {
  const authActivityLog = sequelize.define(
    "auth_activity_logs",
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      user_id: DataTypes.UUID,
      event_type: DataTypes.TEXT,
      ip_address: DataTypes.TEXT,
      user_agent: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    { timestamps: false }
  );
  return authActivityLog;
};
