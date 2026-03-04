"use strict";

const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    async up(queryInterface, Sequelize) {
        const adminAuthId = uuidv4();
        const adminUserId = uuidv4();
        const hashedPassword = await bcrypt.hash("123456", 10);

        // 1. Insert System Roles
        await queryInterface.bulkInsert("roles", [
            {
                id: uuidv4(),
                name: "superAdmin",
                description: "Full system access",
                is_system_role: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: uuidv4(),
                name: "user",
                description: "Standard user access",
                is_system_role: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);

        // Get role IDs for mapping
        const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM roles');
        const superAdminRole = roles.find(r => r.name === "superAdmin");
        const userRole = roles.find(r => r.name === "user");

        // 2. Insert Superadmin User
        await queryInterface.bulkInsert("auth_users", [
            {
                id: adminAuthId,
                email: "Superadmin@gmail.com",
                password_hash: hashedPassword,
                created_at: new Date(),
            },
        ]);

        await queryInterface.bulkInsert("users", [
            {
                id: adminUserId,
                name: "Superadmin",
                folio: "SUPERADMIN-001",
                auth_user_id: adminAuthId,
            },
        ]);

        await queryInterface.bulkInsert("user_roles", [
            {
                id: uuidv4(),
                user_id: adminAuthId,
                role: "superAdmin",
                created_at: new Date(),
            },
        ]);

        // 3. Insert Sidebar Items (from Supabase migration)
        const sidebarItemsData = [
            { name: "Dashboard", href: "/", icon: "LayoutDashboard", display_order: 1 },
            { name: "Portfolio", href: "/portfolio", icon: "Briefcase", display_order: 2 },
            { name: "Mutual Funds", href: "/mutual-funds", icon: "Landmark", display_order: 3 },
            { name: "Derivatives", href: "/derivatives", icon: "TrendingDown", display_order: 4 },
            { name: "Transactions", href: "/transactions", icon: "ArrowLeftRight", display_order: 5 },
            { name: "Transaction Reports", href: "/transaction-reports", icon: "TableProperties", display_order: 6 },
            { name: "P&L Report", href: "/pnl", icon: "TrendingUp", display_order: 7 },
            { name: "Capital Gains", href: "/capital-gains", icon: "PieChart", display_order: 8 },
            { name: "Stock Reports", href: "/stock-reports", icon: "FileText", display_order: 9 },
            { name: "User Management", href: "/admin/users", icon: "Users", display_order: 10 },
            { name: "Roles Management", href: "/admin/roles", icon: "Shield", display_order: 11 },
            { name: "Real Estate", href: "/admin/real-estate", icon: "Building2", display_order: 12 },
            { name: "Gold", href: "/admin/gold", icon: "Coins", display_order: 13 },
            { name: "Flats", href: "/admin/flats", icon: "Home", display_order: 14 },
            { name: "Rental Properties", href: "/admin/rental-properties", icon: "KeyRound", display_order: 15 },
            { name: "Analytics", href: "/admin/analytics", icon: "BarChart3", display_order: 16 },
            { name: "Notification History", href: "/admin/notifications", icon: "Bell", display_order: 17 },
        ].map(item => ({
            ...item,
            id: uuidv4(),
            is_active: true,
            created_at: new Date(),
        }));

        await queryInterface.bulkInsert("sidebar_items", sidebarItemsData);

        // 4. Map Sidebar Items to Roles
        const roleSidebarItems = [];

        // User role gets basic items (where display_order <= 9)
        sidebarItemsData.filter(item => item.display_order <= 9).forEach(item => {
            roleSidebarItems.push({
                id: uuidv4(),
                role_id: userRole.id,
                sidebar_item_id: item.id,
                created_at: new Date(),
            });
        });

        // SuperAdmin gets all items
        sidebarItemsData.forEach(item => {
            roleSidebarItems.push({
                id: uuidv4(),
                role_id: superAdminRole.id,
                sidebar_item_id: item.id,
                created_at: new Date(),
            });
        });

        await queryInterface.bulkInsert("role_sidebar_items", roleSidebarItems);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("role_sidebar_items", null, {});
        await queryInterface.bulkDelete("sidebar_items", null, {});
        await queryInterface.bulkDelete("user_roles", null, {});
        await queryInterface.bulkDelete("users", null, {});
        await queryInterface.bulkDelete("auth_users", null, {});
        await queryInterface.bulkDelete("roles", null, {});
    },
};
