const { createRental, getAllRentals, updateRental, deleteRental } = require("../services/rental.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("rentalController");

const create = async (req, res) => {
    try {
        const rental = await createRental(req.body);
        logger.info("Rental property created");
        res.status(201).json(rental);
    } catch (err) {
        logger.error(`Create rental error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        const rentals = await getAllRentals();
        res.json(rentals);
    } catch (err) {
        logger.error(`Get rentals error: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch rental properties" });
    }
};

const update = async (req, res) => {
    try {
        const rental = await updateRental(req.params.id, req.body);
        logger.info("Rental property updated");
        res.json(rental);
    } catch (err) {
        logger.error(`Update rental error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await deleteRental(req.params.id);
        logger.info("Rental property deleted");
        res.json({ message: "Rental property deleted successfully" });
    } catch (err) {
        logger.error(`Delete rental error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    create,
    getAll,
    update,
    remove
};
