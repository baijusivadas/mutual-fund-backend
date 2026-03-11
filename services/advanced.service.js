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
    // If superAdmin, check if the model exists in db, otherwise check ALLOWED_ENTITIES
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

const getAllItems = async (entityName, userId, userRole) => {
    const model = getModel(entityName, userRole);
    const where = userRole === 'superAdmin' ? {} : { created_by: userId };
    return await model.findAll({ where });
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
