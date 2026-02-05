const express = require("express");
const { create, getAll, update, remove } = require("../controllers/rental.controller");
const router = express.Router();

router.post("/rentals", create);
router.get("/rentals", getAll);
router.put("/rentals/:id", update);
router.delete("/rentals/:id", remove);

module.exports = router;
