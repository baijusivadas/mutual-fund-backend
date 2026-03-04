module.exports = (sequelize, DataTypes) => {
    const pendingUser = sequelize.define(
        "pending_users",
        {
            id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
            email: { type: DataTypes.TEXT, unique: true, allowNull: false },
            password_hash: { type: DataTypes.TEXT, allowNull: false },
            otp: { type: DataTypes.STRING, allowNull: false },
            otp_expires_at: { type: DataTypes.DATE, allowNull: false },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "pending_users", timestamps: false }
    );

    return pendingUser;
};
