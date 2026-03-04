const express = require("express");
const { create, getAll, update, remove } = require("../controllers/gold.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/gold", authenticate, authorize(), create);
router.get("/gold", authenticate, authorize(), getAll);
router.put("/gold/:id", authenticate, authorize(), update);
router.delete("/gold/:id", authenticate, authorize(), remove);

module.exports = router;
