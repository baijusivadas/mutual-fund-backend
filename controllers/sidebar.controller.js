const db = require("../models");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("sidebarController");

const getSidebarItems = async (req, res, next) => {
    try {
        const userRole = req.user.role;

        // 1. Get the role ID
        const role = await db.roles.findOne({
            where: { name: userRole }
        });

        if (!role) {
            return res.status(404).json({ error: "Role not found" });
        }

        // 2. Get sidebar items for this role
        const items = await db.sidebar_items.findAll({
            include: [{
                model: db.roles,
                where: { id: role.id },
                attributes: [],
                through: { attributes: [] }
            }],
            where: { is_active: true },
            order: [['display_order', 'ASC']]
        });

        res.json(items);
    } catch (err) {
        logger.error(`Get sidebar items error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    getSidebarItems,
};
