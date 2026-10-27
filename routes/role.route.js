const express = require('express');
const {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole,
  getSidebarItemsAdmin,
  getRoleSidebarItems,
  updateRoleSidebarItems,
} = require('../controllers/role.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/role', authenticate, authorize(['superAdmin']), createRole);
router.get('/role', authenticate, authorize(['superAdmin']), getAllRoles);
router.put('/role/:id', authenticate, authorize(['superAdmin']), updateRole);
router.delete('/role/:id', authenticate, authorize(['superAdmin']), deleteRole);

router.get('/sidebar-items-admin', authenticate, authorize(['superAdmin']), getSidebarItemsAdmin);
router.get('/role-sidebar-items', authenticate, authorize(['superAdmin']), getRoleSidebarItems);
router.post('/role-sidebar-items', authenticate, authorize(['superAdmin']), updateRoleSidebarItems);

module.exports = router;
