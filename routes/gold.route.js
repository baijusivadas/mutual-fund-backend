const express = require("express");
const { create, getAll, update, remove } = require("../controllers/gold.controller");
const router = express.Router();

router.post("/gold", create);
router.get("/gold", getAll);
router.put("/gold/:id", update);
router.delete("/gold/:id", remove);

module.exports = router;
