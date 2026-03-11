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

// Middleware to inject model name
const setModel = (req, res, next) => {
    req.params.model = "notification_history";
    next();
};

router.use(authenticate, setModel);

router.get("/", getAllItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
