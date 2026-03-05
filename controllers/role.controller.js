const roleService = require("../services/role.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("roleController");

const createRole = async (req, res, next) => {
    try {
        const role = await roleService.createRole(req.body);
        logger.info("Role created");
        res.status(201).json(role);
    } catch (err) {
        logger.error(`Create role error: ${err.message}`);
        next(err);
    }
};

const getAllRoles = async (req, res, next) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json(roles);
    } catch (err) {
        logger.error(`Get roles error: ${err.message}`);
        next(err);
    }
};

const updateRole = async (req, res, next) => {
    try {
        const role = await roleService.updateRole(req.params.id, req.body);
        logger.info("Role updated");
        res.json(role);
    } catch (err) {
        logger.error(`Update role error: ${err.message}`);
        next(err);
    }
};

const deleteRole = async (req, res, next) => {
    try {
        await roleService.deleteRole(req.params.id);
        logger.info("Role deleted");
        res.json({ message: "Role deleted successfully" });
    } catch (err) {
        logger.error(`Delete role error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    createRole,
    getAllRoles,
    updateRole,
    deleteRole
};
