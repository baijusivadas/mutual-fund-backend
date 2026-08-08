const express = require("express");
const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require("../controllers/advanced.controller");
const authenticate = require("../middlewares/auth.middleware");
const router = express.Router();

const injectModel = require("../middlewares/injectModel");

router.use(authenticate, injectModel("real_estate"));

router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
