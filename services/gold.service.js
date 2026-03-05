const { gold } = require("../models");

const createGoldItem = async (data) => {
    return await gold.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllGoldItems = async () => {
    return await gold.findAll();
};

const updateGoldItem = async (id, data) => {
    const item = await gold.findByPk(id);
    if (!item) throw new Error("Gold item not found");
    return await item.update({ ...data, updated_at: new Date() });
};

const deleteGoldItem = async (id) => {
    const item = await gold.findByPk(id);
    if (!item) throw new Error("Gold item not found");
    return await item.destroy();
};

module.exports = {
    createGoldItem,
    getAllGoldItems,
    updateGoldItem,
    deleteGoldItem
};
