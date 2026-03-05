const fs = require("fs");
const {
  processTransactionFile,
  calculateTransactionsXirr,
} = require("../services/transaction.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("transactionController");

// Upload + Process Excel
const uploadTransactionFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await processTransactionFile(req.file.path);
    logger.info(`Excel file processed successfully: ${result.count} records`);

    res.json({
      message: "File processed and data stored in database",
      count: result.count,
      data: result.transactions,
    });
  } catch (err) {
    logger.error(`Transaction file processing error: ${err.message}`);
    next(err);
  } finally {
    // Ensure file is deleted even if processing fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error(`Failed to delete temp file: ${err.message}`);
      });
    }
  }
};

// Get XIRR Data
const fetchTransactionData = async (req, res, next) => {
  try {
    const data = await calculateTransactionsXirr();
    logger.info("Fetched XIRR data successfully");
    res.json(data);
  } catch (err) {
    logger.error(`Get transaction data error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  uploadTransactionFile,
  fetchTransactionData,
};
