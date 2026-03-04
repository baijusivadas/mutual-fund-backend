const express = require("express");
const multer = require("multer");
const { transactionFile, getTransactionData } = require("../controllers/transaction.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// All routes here will allow superAdmin full access thanks to the bypass in authorize()
router.post("/transaction", authenticate, authorize(), upload.single("file"), transactionFile);
router.get("/transaction", authenticate, authorize(), getTransactionData);

module.exports = router;
