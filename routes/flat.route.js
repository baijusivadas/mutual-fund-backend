const express = require("express");
const { create, getAll, update, remove } = require("../controllers/flat.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();

// Apply authorization for 'superAdmin' to each route
router.post("/flats", authenticate, authorize("superAdmin"), create);
router.get("/flats", authenticate, authorize("superAdmin"), getAll);
router.put("/flats/:id", authenticate, authorize("superAdmin"), update);
router.delete("/flats/:id", authenticate, authorize("superAdmin"), remove);

module.exports = router;
