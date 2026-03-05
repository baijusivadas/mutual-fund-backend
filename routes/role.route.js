const express = require("express");
const { createRole, getAllRoles, updateRole, deleteRole } = require("../controllers/role.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/role", authenticate, authorize(), createRole);
router.get("/role", authenticate, authorize(), getAllRoles);
router.put("/role/:id", authenticate, authorize(), updateRole);
router.delete("/role/:id", authenticate, authorize(), deleteRole);

module.exports = router;
