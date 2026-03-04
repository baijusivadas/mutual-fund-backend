module.exports = (sequelize, DataTypes) => {
    const activeSession = sequelize.define(
        "active_sessions",
        {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            auth_user_id: { type: DataTypes.UUID, allowNull: false },
            token: { type: DataTypes.TEXT, allowNull: false },
            last_activity: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            expires_at: { type: DataTypes.DATE, allowNull: false },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "active_sessions", timestamps: false }
    );

    activeSession.associate = (models) => {
        activeSession.belongsTo(models.auth_users, { foreignKey: "auth_user_id" });
    };

    return activeSession;
};
