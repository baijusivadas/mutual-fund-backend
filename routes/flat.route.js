const express = require("express");
const { createFlatItem, getAllFlatItems, updateFlatItem, deleteFlatItem } = require("../controllers/flat.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Apply authorization for 'superAdmin' to each route
router.post("/flat", authenticate, authorize(), createFlatItem);
router.get("/flat", authenticate, authorize(), getAllFlatItems);
router.put("/flat/:id", authenticate, authorize(), updateFlatItem);
router.delete("/flat/:id", authenticate, authorize(), deleteFlatItem);

module.exports = router;
