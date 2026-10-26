const { flats } = require('../models');
const crypto = require('crypto');

const createFlatItem = async (data, userId) => {
  return await flats.create({
    ...data,
    id: crypto.randomUUID(),
    created_by: userId,
    created_at: new Date(),
  });
};

const getAllFlatItems = async (userId, userRole) => {
  const where = userRole === 'superAdmin' ? {} : { created_by: userId };
  return await flats.findAll({ where });
};

const updateFlatItem = async (id, data, userId, userRole) => {
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
  const flat = await flats.findOne({ where });
  if (!flat) throw new Error('Flat not found');
  const safeData = { ...data };
  delete safeData.id;
  delete safeData.created_by;
  return await flat.update({ ...safeData, updated_at: new Date() });
};

const deleteFlatItem = async (id, userId, userRole) => {
  const where = userRole === 'superAdmin' ? { id } : { id, created_by: userId };
  const flat = await flats.findOne({ where });
  if (!flat) throw new Error('Flat not found');
  return await flat.destroy();
};

module.exports = {
  createFlatItem,
  getAllFlatItems,
  updateFlatItem,
  deleteFlatItem,
};
