const { createRole, getRoles, updateRole, deleteRole } = require("../services/role.service");
const { createControllerLogger } = require("../middlewares/logger");
const logger = createControllerLogger("roleController");

const create = async (req, res) => {
    try {
        const role = await createRole(req.body);
        logger.info("Role created");
        res.status(201).json(role);
    } catch (err) {
        logger.error(`Create role error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        const roles = await getRoles();
        res.json(roles);
    } catch (err) {
        logger.error(`Get roles error: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch roles" });
    }
};

const update = async (req, res) => {
    try {
        const role = await updateRole(req.params.id, req.body);
        logger.info("Role updated");
        res.json(role);
    } catch (err) {
        logger.error(`Update role error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        await deleteRole(req.params.id);
        logger.info("Role deleted");
        res.json({ message: "Role deleted successfully" });
    } catch (err) {
        logger.error(`Delete role error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    create,
    getAll,
    update,
    remove
};
