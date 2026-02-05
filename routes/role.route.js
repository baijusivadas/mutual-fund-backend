const express = require("express");
const { create, getAll, update, remove } = require("../controllers/role.controller");
const router = express.Router();

router.post("/roles", create);
router.get("/roles", getAll);
router.put("/roles/:id", update);
router.delete("/roles/:id", remove);

module.exports = router;
