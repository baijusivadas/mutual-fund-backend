const express = require("express");
const { 
  createRole, getAllRoles, updateRole, deleteRole,
  getSidebarItemsAdmin, getRoleSidebarItems, updateRoleSidebarItems
} = require("../controllers/role.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/role", authenticate, authorize(), createRole);
router.get("/role", authenticate, authorize(), getAllRoles);
router.put("/role/:id", authenticate, authorize(), updateRole);
router.delete("/role/:id", authenticate, authorize(), deleteRole);

router.get("/sidebar-items-admin", authenticate, authorize(), getSidebarItemsAdmin);
router.get("/role-sidebar-items", authenticate, authorize(), getRoleSidebarItems);
router.post("/role-sidebar-items", authenticate, authorize(), updateRoleSidebarItems);

module.exports = router;
