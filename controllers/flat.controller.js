const { createFlat, getAllFlats, updateFlat, deleteFlat } = require("../services/flat.service");
const { createControllerLogger } = require("../middlewares/logger");
const logger = createControllerLogger("flatController");

const create = async (req, res) => {
    try {
        const flat = await createFlat(req.body);
        logger.info("Flat created");
        res.status(201).json(flat);
    } catch (err) {
        logger.error(`Create flat error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        const flats = await getAllFlats();
        res.json(flats);
    } catch (err) {
        logger.error(`Get flats error: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch flats" });
    }
};

const update = async (req, res) => {
    try {
        const flat = await updateFlat(req.params.id, req.body);
        logger.info("Flat updated");
        res.json(flat);
    } catch (err) {
        logger.error(`Update flat error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await deleteFlat(req.params.id);
        logger.info("Flat deleted");
        res.json({ message: "Flat deleted successfully" });
    } catch (err) {
        logger.error(`Delete flat error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    create,
    getAll,
    update,
    remove
};
