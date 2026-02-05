const express = require("express");
const multer = require("multer");
const { transactionFile, getTransactionData } = require("../controllers/transaction.controller");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/transaction", upload.single("file"), transactionFile);
router.get("/transaction", getTransactionData);

module.exports = router;
