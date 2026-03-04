module.exports = (sequelize, DataTypes) => {
    const RoleSidebarItem = sequelize.define(
        "role_sidebar_items",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            role_id: { type: DataTypes.UUID, allowNull: false },
            sidebar_item_id: { type: DataTypes.UUID, allowNull: false },
            created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        { tableName: "role_sidebar_items", timestamps: false }
    );

    return RoleSidebarItem;
};
