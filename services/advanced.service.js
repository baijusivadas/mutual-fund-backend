const db = require('../models');
const { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } = require('../config/constants');

const ALLOWED_ENTITIES = [
  'crypto_investments',
  'bonds',
  'etfs',
  'nps_investments',
  'bank_accounts',
  'provident_funds',
  'liabilities',
  'custom_assets',
  'real_estate',
  'rental_properties',
  'flats',
  'gold',
  'derivatives',
  'notification_history',
];

const getModel = (entityName, userRole) => {
  if (userRole === 'superAdmin') {
    if (!db[entityName]) {
      throw new Error(`Entity '${entityName}' does not exist in the database`);
    }
    return db[entityName];
  }

  if (!ALLOWED_ENTITIES.includes(entityName)) {
    throw new Error(`Entity '${entityName}' is not allowed`);
  }

  // Guard: entity is whitelisted but may still be missing from db (e.g. renamed model)
  if (!db[entityName]) {
    throw new Error(`Entity '${entityName}' is not available`);
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
 * @param {number} page  - 1-based page number (default: DEFAULT_PAGE)
 * @param {number} limit - records per page (default: DEFAULT_PAGE_LIMIT, max: MAX_PAGE_LIMIT)
 */
const getAllItems = async (
  entityName,
  userId,
  userRole,
  page = DEFAULT_PAGE,
  limit = DEFAULT_PAGE_LIMIT
) => {
  const model = getModel(entityName, userRole);
  const where = userRole === 'superAdmin' ? {} : { created_by: userId };

  // Clamp limit dynamically using configurable bounds
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
  const safeOffset = (Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1) - 1) * safeLimit;

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
      page: Math.max(parseInt(page, 10) || DEFAULT_PAGE, 1),
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
    throw new Error('Item not found or unauthorized');
  }
  const safeData = { ...data };
  delete safeData.id;
  delete safeData.created_by;
  return await item.update(safeData);
};

const deleteItem = async (entityName, id, userId, userRole) => {
  const model = getModel(entityName, userRole);
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };

  const item = await model.findOne({ where });
  if (!item) {
    throw new Error('Item not found or unauthorized');
  }
  return await item.destroy();
};

const getItemById = async (entityName, id, userId, userRole) => {
  const model = getModel(entityName, userRole);
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
  const item = await model.findOne({ where });
  if (!item) {
    throw new Error('Item not found or unauthorized');
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
