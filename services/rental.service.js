const { rental_properties } = require("../models");

const createRentalItem = async (data) => {
    return await rental_properties.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllRentalItems = async () => {
    return await rental_properties.findAll();
};

const updateRentalItem = async (id, data) => {
    const rental = await rental_properties.findByPk(id);
    if (!rental) throw new Error("Rental property not found");
    return await rental.update({ ...data, updated_at: new Date() });
};

const deleteRentalItem = async (id) => {
    const rental = await rental_properties.findByPk(id);
    if (!rental) throw new Error("Rental property not found");
    return await rental.destroy();
};

module.exports = {
    createRentalItem,
    getAllRentalItems,
    updateRentalItem,
    deleteRentalItem
};
