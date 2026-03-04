module.exports = (sequelize, DataTypes) => {
    const SidebarItem = sequelize.define(
        "sidebar_items",
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: { type: DataTypes.TEXT, allowNull: false },
            href: { type: DataTypes.TEXT, allowNull: false },
            icon: { type: DataTypes.TEXT, allowNull: false },
            display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
            parent_id: DataTypes.UUID,
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        },
        { tableName: "sidebar_items", timestamps: false }
    );

    SidebarItem.associate = (models) => {
        SidebarItem.hasMany(models.sidebar_items, { foreignKey: "parent_id" });
        SidebarItem.belongsTo(models.sidebar_items, { foreignKey: "parent_id" });
        SidebarItem.belongsToMany(models.roles, {
            through: "role_sidebar_items",
            foreignKey: "sidebar_item_id",
            otherKey: "role_id",
        });
    };

    return SidebarItem;
};
