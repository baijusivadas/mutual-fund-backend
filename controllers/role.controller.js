const roleService = require('../services/role.service');
const { createControllerLogger } = require('../utils/logger');
const logger = createControllerLogger('roleController');

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    logger.info('Role created');
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
    logger.info('Role updated');
    res.json(role);
  } catch (err) {
    logger.error(`Update role error: ${err.message}`);
    next(err);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id);
    logger.info('Role deleted');
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    logger.error(`Delete role error: ${err.message}`);
    next(err);
  }
};

const db = require('../models');

const getSidebarItemsAdmin = async (req, res, next) => {
  try {
    const items = await db.sidebar_items.findAll({ order: [['display_order', 'ASC']] });
    res.json(items);
  } catch (err) {
    logger.error(`Get sidebar items admin error: ${err.message}`);
    next(err);
  }
};

const getRoleSidebarItems = async (req, res, next) => {
  try {
    const items = await db.role_sidebar_items.findAll();
    res.json(items);
  } catch (err) {
    logger.error(`Get role sidebar items error: ${err.message}`);
    next(err);
  }
};

const updateRoleSidebarItems = async (req, res, next) => {
  try {
    const { roleId, sidebarItemIds } = req.body;

    await db.role_sidebar_items.destroy({ where: { role_id: roleId } });

    if (sidebarItemIds && sidebarItemIds.length > 0) {
      const insertData = sidebarItemIds.map((sid) => ({
        role_id: roleId,
        sidebar_item_id: sid,
      }));
      await db.role_sidebar_items.bulkCreate(insertData);
    }
    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    logger.error(`Update role sidebar items error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getSidebarItemsAdmin,
  getRoleSidebarItems,
  updateRoleSidebarItems,
};
