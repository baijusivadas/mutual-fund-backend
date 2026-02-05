const express = require("express");
const { create, getAll, update, remove } = require("../controllers/flat.controller");
const router = express.Router();

router.post("/flats", create);
router.get("/flats", getAll);
router.put("/flats/:id", update);
router.delete("/flats/:id", remove);

module.exports = router;
