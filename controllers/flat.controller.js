const flatService = require("../services/flat.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("flatController");

const createFlatItem = async (req, res, next) => {
    try {
        const flat = await flatService.createFlatItem(req.body);
        logger.info("Flat created");
        res.status(201).json(flat);
    } catch (err) {
        logger.error(`Create flat error: ${err.message}`);
        next(err);
    }
};

const getAllFlatItems = async (req, res, next) => {
    try {
        const flats = await flatService.getAllFlatItems();
        res.json(flats);
    } catch (err) {
        logger.error(`Get flats error: ${err.message}`);
        next(err);
    }
};

const updateFlatItem = async (req, res, next) => {
    try {
        const flat = await flatService.updateFlatItem(req.params.id, req.body);
        logger.info("Flat updated");
        res.json(flat);
    } catch (err) {
        logger.error(`Update flat error: ${err.message}`);
        next(err);
    }
};

const deleteFlatItem = async (req, res, next) => {
    try {
        await flatService.deleteFlatItem(req.params.id);
        logger.info("Flat deleted");
        res.json({ message: "Flat deleted successfully" });
    } catch (err) {
        logger.error(`Delete flat error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    createFlatItem,
    getAllFlatItems,
    updateFlatItem,
    deleteFlatItem
};
