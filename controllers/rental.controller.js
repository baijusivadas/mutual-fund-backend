const rentalService = require("../services/rental.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("rentalController");

const createRentalItem = async (req, res, next) => {
    try {
        const rental = await rentalService.createRentalItem(req.body);
        logger.info("Rental property created");
        res.status(201).json(rental);
    } catch (err) {
        logger.error(`Create rental error: ${err.message}`);
        next(err);
    }
};

const getAllRentalItems = async (req, res, next) => {
    try {
        const rentals = await rentalService.getAllRentalItems();
        res.json(rentals);
    } catch (err) {
        logger.error(`Get rentals error: ${err.message}`);
        next(err);
    }
};

const updateRentalItem = async (req, res, next) => {
    try {
        const rental = await rentalService.updateRentalItem(req.params.id, req.body);
        logger.info("Rental property updated");
        res.json(rental);
    } catch (err) {
        logger.error(`Update rental error: ${err.message}`);
        next(err);
    }
};

const deleteRentalItem = async (req, res, next) => {
    try {
        await rentalService.deleteRentalItem(req.params.id);
        logger.info("Rental property deleted");
        res.json({ message: "Rental property deleted successfully" });
    } catch (err) {
        logger.error(`Delete rental error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    createRentalItem,
    getAllRentalItems,
    updateRentalItem,
    deleteRentalItem
};
