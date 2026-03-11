const express = require("express");
const { createItem, getAllItems, updateItem, deleteItem, uploadDocument } = require("../controllers/advanced.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/advanced/:entity", authenticate, authorize(), createItem);
router.post("/advanced/:entity/upload", authenticate, authorize(), upload.single('document'), uploadDocument);
router.get("/advanced/:entity", authenticate, authorize(), getAllItems);
router.put("/advanced/:entity/:id", authenticate, authorize(), updateItem);
router.delete("/advanced/:entity/:id", authenticate, authorize(), deleteItem);

module.exports = router;
