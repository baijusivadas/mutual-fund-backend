const express = require("express");
const { create, getAll, update, remove } = require("../controllers/role.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/roles", authenticate, authorize('superAdmin'), create);
router.get("/roles", authenticate, authorize('superAdmin'), getAll);
router.put("/roles/:id", authenticate, authorize('superAdmin'), update);
router.delete("/roles/:id", authenticate, authorize('superAdmin'), remove);

module.exports = router;
