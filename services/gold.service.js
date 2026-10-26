const { gold } = require('../models');
const crypto = require('crypto');

const createGoldItem = async (data, userId) => {
  return await gold.create({
    ...data,
    id: crypto.randomUUID(),
    created_by: userId,
    created_at: new Date(),
  });
};

const getAllGoldItems = async (userId, userRole) => {
  const where = userRole === 'superAdmin' ? {} : { created_by: userId };
  return await gold.findAll({ where });
};

const updateGoldItem = async (id, data, userId, userRole) => {
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
  const item = await gold.findOne({ where });
  if (!item) throw new Error('Gold item not found');
  const safeData = { ...data };
  delete safeData.id;
  delete safeData.created_by;
  return await item.update({ ...safeData, updated_at: new Date() });
};

const deleteGoldItem = async (id, userId, userRole) => {
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
  const item = await gold.findOne({ where });
  if (!item) throw new Error('Gold item not found');
  return await item.destroy();
};

module.exports = {
  createGoldItem,
  getAllGoldItems,
  updateGoldItem,
  deleteGoldItem,
};
