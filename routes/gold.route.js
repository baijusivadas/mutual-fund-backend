const express = require("express");
const { createGoldItem, getAllGoldItems, updateGoldItem, deleteGoldItem } = require("../controllers/gold.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

router.post("/gold", authenticate, authorize(), createGoldItem);
router.get("/gold", authenticate, authorize(), getAllGoldItems);
router.put("/gold/:id", authenticate, authorize(), updateGoldItem);
router.delete("/gold/:id", authenticate, authorize(), deleteGoldItem);

module.exports = router;
