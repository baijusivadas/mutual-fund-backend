const advancedService = require("../services/advanced.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("advancedController");

const createItem = async (req, res, next) => {
    try {
        const { entity } = req.params;
        const item = await advancedService.createItem(entity, req.body, req.user.id, req.user.role);
        logger.info(`${entity} item created`);
        res.status(201).json(item);
    } catch (err) {
        logger.error(`Create ${req.params.entity} error: ${err.message}`);
        next(err);
    }
};

const getAllItems = async (req, res, next) => {
    try {
        const { entity } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const result = await advancedService.getAllItems(entity, req.user.id, req.user.role, page, limit);
        res.json(result);
    } catch (err) {
        logger.error(`Get ${req.params.entity} error: ${err.message}`);
        next(err);
    }
};

const updateItem = async (req, res, next) => {
    try {
        const { entity, id } = req.params;
        const item = await advancedService.updateItem(entity, id, req.body, req.user.id, req.user.role);
        logger.info(`${entity} item updated`);
        res.json(item);
    } catch (err) {
        logger.error(`Update ${req.params.entity} error: ${err.message}`);
        next(err);
    }
};

const deleteItem = async (req, res, next) => {
    try {
        const { entity, id } = req.params;
        await advancedService.deleteItem(entity, id, req.user.id, req.user.role);
        logger.info(`${entity} item deleted`);
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        logger.error(`Delete ${req.params.entity} error: ${err.message}`);
        next(err);
    }
};

const uploadDocument = async (req, res, next) => {
    try {
        const { entity } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "No document provided" });
        }

        const document_url = `/uploads/${req.file.filename}`;

        logger.info(`${entity} document uploaded`);
        res.status(200).json({ document_url });
    } catch (err) {
        logger.error(`Upload ${req.params.entity} error: ${err.message}`);
        next(err);
    }
};

const getItemById = async (req, res, next) => {
    try {
        const { entity, id } = req.params;
        const item = await advancedService.getItemById(entity, id, req.user.id, req.user.role);
        res.json(item);
    } catch (err) {
        logger.error(`Get ${req.params.entity} by id error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    createItem,
    getItemById,
    getAllItems,
    updateItem,
    deleteItem,
    uploadDocument,
};
