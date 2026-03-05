const express = require("express");
const { createRentalItem, getAllRentalItems, updateRentalItem, deleteRentalItem } = require("../controllers/rental.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Apply authorization (superAdmin access) to specific routes
router.post("/rentals", authenticate, authorize("superAdmin"), createRentalItem);
router.get("/rentals", authenticate, authorize("superAdmin"), getAllRentalItems);
router.put("/rentals/:id", authenticate, authorize("superAdmin"), updateRentalItem);
router.delete("/rentals/:id", authenticate, authorize("superAdmin"), deleteRentalItem);

module.exports = router;
