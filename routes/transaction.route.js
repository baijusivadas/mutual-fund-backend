const express = require('express');
const {
  uploadTransactionFile,
  fetchTransactionData,
} = require('../controllers/transaction.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware'); // ← use shared middleware (10MB limit, file type filter)

const router = express.Router();

// Upload is restricted to superAdmin; all authenticated users can read XIRR data
router.post(
  '/transaction',
  authenticate,
  authorize(['superAdmin']),
  upload.single('file'),
  uploadTransactionFile
);
router.get('/transaction', authenticate, authorize(), fetchTransactionData);

module.exports = router;
