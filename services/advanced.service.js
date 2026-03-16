const db = require("../models");

const ALLOWED_ENTITIES = [
    "crypto_investments",
    "bonds",
    "etfs",
    "nps_investments",
    "bank_accounts",
    "provident_funds",
    "liabilities",
    "custom_assets",
    "real_estate",
    "derivatives",
    "user_investment_mappings",
    "notification_history",
    "purchases",
];

const getModel = (entityName, userRole) => {
    if (userRole === 'superAdmin') {
        if (!db[entityName]) {
            throw new Error(`Entity ${entityName} does not exist in database`);
        }
        return db[entityName];
    }

    if (!ALLOWED_ENTITIES.includes(entityName)) {
        throw new Error(`Entity ${entityName} is not allowed`);
    }
    return db[entityName];
};

const createItem = async (entityName, data, userId, userRole) => {
    const model = getModel(entityName, userRole);
    return await model.create({ ...data, created_by: userId });
};

/**
 * Get all items with pagination support.
 * @param {string} entityName
 * @param {string} userId
 * @param {string} userRole
 * @param {number} page  - 1-based page number (default: 1)
 * @param {number} limit - records per page (default: 20, max: 100)
 */
const getAllItems = async (entityName, userId, userRole, page = 1, limit = 20) => {
    const model = getModel(entityName, userRole);
    const where = userRole === 'superAdmin' ? {} : { created_by: userId };

    // Clamp limit to prevent overly large queries
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const safeOffset = (Math.max(parseInt(page) || 1, 1) - 1) * safeLimit;

    const { count, rows } = await model.findAndCountAll({
        where,
        limit: safeLimit,
        offset: safeOffset,
        order: [['created_at', 'DESC']],
    });

    return {
        data: rows,
        pagination: {
            total: count,
            page: Math.max(parseInt(page) || 1, 1),
            limit: safeLimit,
            totalPages: Math.ceil(count / safeLimit),
        },
    };
};

const updateItem = async (entityName, id, data, userId, userRole) => {
    const model = getModel(entityName, userRole);
    const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };

    const item = await model.findOne({ where });
    if (!item) {
        throw new Error("Item not found or unauthorized");
    }
    return await item.update(data);
};

const deleteItem = async (entityName, id, userId, userRole) => {
    const model = getModel(entityName, userRole);
    const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };

    const item = await model.findOne({ where });
    if (!item) {
        throw new Error("Item not found or unauthorized");
    }
    return await item.destroy();
};

const getItemById = async (entityName, id, userId, userRole) => {
    const model = getModel(entityName, userRole);
    const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
    const item = await model.findOne({ where });
    if (!item) {
        throw new Error("Item not found or unauthorized");
    }
    return item;
};

module.exports = {
    createItem,
    getItemById,
    getAllItems,
    updateItem,
    deleteItem,
};
