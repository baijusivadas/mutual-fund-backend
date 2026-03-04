const express = require("express");
const { create, getAll, update, remove } = require("../controllers/rental.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Apply authorization (superAdmin access) to specific routes
router.post("/rentals", authenticate, authorize("superAdmin"), create);
router.get("/rentals", authenticate, authorize("superAdmin"), getAll);
router.put("/rentals/:id", authenticate, authorize("superAdmin"), update);
router.delete("/rentals/:id", authenticate, authorize("superAdmin"), remove);

module.exports = router;
