const fs = require("fs");
const {
  processTransaction,
  calculateXirr,
} = require("../services/transaction.service");
const { createControllerLogger } = require("../utils/logger");

// 🔹 Create logger for this controller
const logger = createControllerLogger("transactionController");

// Upload + Process Excel
const transactionFile = async (req, res) => {
  try {
    if (!req.file) {
      logger.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const result = await processTransaction(req.file.path);
      logger.info(`Excel file processed successfully: ${result.count} records`);

      res.json({
        message: "File processed and data stored in database",
        count: result.count,
        data: result.transactions,
      });
    } catch (err) {
      logger.error(`Error processing file: ${err.message}`);
      return res.status(400).json({ error: err.message || "Invalid or unreadable Excel file" });
    }
  } catch (err) {
    logger.error(`Error in uploadFile: ${err.message}`);
    res.status(500).json({ error: err.message || "Failed to process file" });
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
const getTransactionData = async (req, res) => {
  try {
    const data = await calculateXirr();
    logger.info("Fetched XIRR data successfully");
    res.json(data);
  } catch (err) {
    logger.error(`Error fetching XIRR data: ${err.message}`);
    res.status(500).json({ error: "Failed to load buffer data" });
  }
};

module.exports = {
  transactionFile,
  getTransactionData,
};
