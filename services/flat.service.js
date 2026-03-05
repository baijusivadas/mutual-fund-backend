const { flats } = require("../models");

const createFlatItem = async (data) => {
    return await flats.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllFlatItems = async () => {
    return await flats.findAll();
};

const updateFlatItem = async (id, data) => {
    const flat = await flats.findByPk(id);
    if (!flat) throw new Error("Flat not found");
    return await flat.update({ ...data, updated_at: new Date() });
};

const deleteFlatItem = async (id) => {
    const flat = await flats.findByPk(id);
    if (!flat) throw new Error("Flat not found");
    return await flat.destroy();
};

module.exports = {
    createFlatItem,
    getAllFlatItems,
    updateFlatItem,
    deleteFlatItem
};
