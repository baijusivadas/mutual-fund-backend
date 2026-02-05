const { rental_properties } = require("../models");

const createRental = async (data) => {
    return await rental_properties.create({
        id: require("crypto").randomUUID(),
        ...data,
        created_at: new Date()
    });
};

const getAllRentals = async () => {
    return await rental_properties.findAll();
};

const updateRental = async (id, data) => {
    const rental = await rental_properties.findByPk(id);
    if (!rental) throw new Error("Rental property not found");
    return await rental.update({ ...data, updated_at: new Date() });
};

const deleteRental = async (id) => {
    const rental = await rental_properties.findByPk(id);
    if (!rental) throw new Error("Rental property not found");
    return await rental.destroy();
};

module.exports = {
    createRental,
    getAllRentals,
    updateRental,
    deleteRental
};
