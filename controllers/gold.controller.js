const goldService = require("../services/gold.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("goldController");

const createGoldItem = async (req, res, next) => {
    try {
        const item = await goldService.createGoldItem(req.body);
        logger.info("Gold item created");
        res.status(201).json(item);
    } catch (err) {
        logger.error(`Create gold error: ${err.message}`);
        next(err);
    }
};

const getAllGoldItems = async (req, res, next) => {
    try {
        const items = await goldService.getAllGoldItems();
        res.json(items);
    } catch (err) {
        logger.error(`Get gold error: ${err.message}`);
        next(err);
    }
};

const updateGoldItem = async (req, res, next) => {
    try {
        const item = await goldService.updateGoldItem(req.params.id, req.body);
        logger.info("Gold item updated");
        res.json(item);
    } catch (err) {
        logger.error(`Update gold error: ${err.message}`);
        next(err);
    }
};

const deleteGoldItem = async (req, res, next) => {
    try {
        await goldService.deleteGoldItem(req.params.id);
        logger.info("Gold item deleted");
        res.json({ message: "Gold item deleted successfully" });
    } catch (err) {
        logger.error(`Delete gold error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    createGoldItem,
    getAllGoldItems,
    updateGoldItem,
    deleteGoldItem
};
