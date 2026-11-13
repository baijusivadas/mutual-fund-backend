'use strict';

const express = require('express');
const { getAuditLogs } = require('../controllers/audit.controller');
const authenticate = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get(
  '/audit-logs',
  authorize(['superAdmin', 'orgAdmin', 'auditor']),
  getAuditLogs
);

module.exports = router;

