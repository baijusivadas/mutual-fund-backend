const { flats } = require("../models");

const createFlat = async (data) => {
    return await flats.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllFlats = async () => {
    return await flats.findAll();
};

const updateFlat = async (id, data) => {
    const flat = await flats.findByPk(id);
    if (!flat) throw new Error("Flat not found");
    return await flat.update({ ...data, updated_at: new Date() });
};

const deleteFlat = async (id) => {
    const flat = await flats.findByPk(id);
    if (!flat) throw new Error("Flat not found");
    return await flat.destroy();
};

module.exports = {
    createFlat,
    getAllFlats,
    updateFlat,
    deleteFlat
};
