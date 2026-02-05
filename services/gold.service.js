const { gold } = require("../models");

const createGold = async (data) => {
    return await gold.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllGold = async () => {
    return await gold.findAll();
};

const updateGold = async (id, data) => {
    const item = await gold.findByPk(id);
    if (!item) throw new Error("Gold item not found");
    return await item.update({ ...data, updated_at: new Date() });
};

const deleteGold = async (id) => {
    const item = await gold.findByPk(id);
    if (!item) throw new Error("Gold item not found");
    return await item.destroy();
};

module.exports = {
    createGold,
    getAllGold,
    updateGold,
    deleteGold
};
