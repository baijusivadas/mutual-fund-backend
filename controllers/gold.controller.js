const { createGold, getAllGold, updateGold, deleteGold } = require("../services/gold.service");
const { createControllerLogger } = require("../middlewares/logger");
const logger = createControllerLogger("goldController");

const create = async (req, res) => {
    try {
        const item = await createGold(req.body);
        logger.info("Gold item created");
        res.status(201).json(item);
    } catch (err) {
        logger.error(`Create gold error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        const items = await getAllGold();
        res.json(items);
    } catch (err) {
        logger.error(`Get gold error: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch gold items" });
    }
};

const update = async (req, res) => {
    try {
        const item = await updateGold(req.params.id, req.body);
        logger.info("Gold item updated");
        res.json(item);
    } catch (err) {
        logger.error(`Update gold error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await deleteGold(req.params.id);
        logger.info("Gold item deleted");
        res.json({ message: "Gold item deleted successfully" });
    } catch (err) {
        logger.error(`Delete gold error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    create,
    getAll,
    update,
    remove
};
